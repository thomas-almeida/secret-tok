import { getPlanById } from "../config/plans.js";
import Transaction from "../models/Transactions.js";
import WebhookEvent from "../models/WebhookEvent.js";
import axios from "axios";
import User from "../models/User.js";
import notificationService from '../services/notificationService.js';
import { EVENT_TYPES } from '../config/notificationEvents.js';
import { calculateAndApplyCommission, checkTransactionStatusAndProcess } from '../services/commissionService.js';

export const createPaymentIntent = async (req, res) => {
    try {

        const { planId, customer, referenceId } = req.body;

        const plan = getPlanById(planId);

        if (!plan) {
            return res.status(400).json({ error: 'Invalid plan ID' });
        }

        const paymentIntent = {
            amount: plan.amount,
            expiresIn: 100000,
            description: plan.description,
            customer: {
                name: customer.name,
                cellphone: customer.cellphone,
                email: customer.email,
                taxId: '50780598814'
            }
        };

        const abacatePayResponse = await axios.post(
            'https://api.abacatepay.com/v1/pixQrCode/create',
            paymentIntent,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.ABKTPAY_DEV}`
                }
            });

        const gatewayId = abacatePayResponse.data?.data?.id;
        console.log('AbacatePay response:', JSON.stringify(abacatePayResponse.data));
        console.log('Creating transaction with gatewayId:', gatewayId);

        // Atualizar assinatura do usuário como pendente
        User.findByIdAndUpdate(customer.userId, {
            subscription: {
                planId: plan.planId,
                amount: plan.amount,
                active: false,
                transactionDate: new Date()
            }
        }).exec();

        // Salvar a transação no banco de dados
        const transaction = new Transaction({
            userId: customer.userId,
            amount: plan.amount,
            gatewayId: gatewayId,
            referenceId: referenceId
        });

        await transaction.save();
        console.log('Transaction saved:', transaction._id, 'gatewayId:', transaction.gatewayId);

        // Se tiver referenceId, salvar também no revenueSchema do afiliado
        if (referenceId && referenceId !== "none") {
            const affiliateUser = await User.findById(referenceId);
            if (affiliateUser) {
                affiliateUser.revenue.transactions.push(transaction.toObject());
                await affiliateUser.save();
            }
        }

        res.status(200).json({
            paymentIntent: abacatePayResponse.data?.data,
            transactionId: transaction._id
        });

    } catch (error) {

        res.status(500).json({
            error: 'Error to create payment intent',
            message: error.message
        })

    }
}

export const checkTransactionStatus = async (req, res) => {

    try {
        const { gatewayId } = req.params;

        const abacatePayResponse = await axios.get(
            `https://api.abacatepay.com/v1/pixQrCode/check?id=${gatewayId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.ABKTPAY_DEV}`
                }
            })


        if (abacatePayResponse.data?.data?.status === 'PAID') {
            const result = await checkTransactionStatusAndProcess(gatewayId);

            if (!result) {
                return res.status(404).json({ error: 'Transaction not found or error processing' });
            }

            if (result.alreadyPaid) {
                return res.status(200).json({
                    message: 'Transaction already processed',
                    transactionStatus: abacatePayResponse.data?.data?.status
                });
            }

            console.log('Transaction processed successfully:', result);

            res.status(200).json({
                message: 'Assinatura ativada com sucesso',
                transactionStatus: abacatePayResponse.data?.data?.status,
                commissionData: result.commissionData
            });
        }

        res.status(200).json({
            message: 'success',
            transactionStatus: abacatePayResponse.data?.data?.status,
        });


    } catch (error) {
        res.status(500).json({
            error: 'Error to check transaction status',
            message: error.message
        })
    }

}

export const webhookAbacatePay = async (req, res) => {
    try {
        const webhookSecret = req.query.webhookSecret;

        if (webhookSecret !== process.env.ABKTPAY_WEBHOOK_SECRET) {
            return res.status(403).json({ error: 'Invalid webhook secret' });
        }

        const event = req.body;
        const eventId = event?.id;
        const eventType = event?.event;

        console.log('Received webhook event:', eventType, 'ID:', eventId);

        if (!eventId || !eventType) {
            return res.status(400).json({ error: 'Missing event ID or type' });
        }

        const existingEvent = await WebhookEvent.findOne({ eventId });
        if (existingEvent) {
            console.log(`ℹ️ Event ${eventId} already processed, skipping.`);
            return res.status(200).json({ received: true, duplicate: true });
        }

        await WebhookEvent.create({
            eventId,
            eventType,
            gatewayId: event?.data?.pixQrCode?.id || event?.data?.billing?.id,
            status: 'pending'
        });

        res.status(200).json({ received: true });

        processWebhookEvent(event).catch(async (error) => {
            console.error('❌ Error processing webhook event:', error);
            await WebhookEvent.findOneAndUpdate(
                { eventId },
                { status: 'failed' }
            );
        });
    } catch (error) {
        console.error('Error in webhook handler:', error);
        res.status(500).json({
            error: 'Error to process webhook',
            message: error.message
        });
    }
};

const processWebhookEvent = async (event) => {
    const eventId = event?.id;
    const eventType = event?.event;

    console.log(event)

    try {
        if (eventType === "billing.paid") {
            const gatewayId = event?.data?.pixQrCode?.id;
            console.log('Processing webhook - Event ID:', eventId, 'Gateway ID from webhook:', gatewayId);

            if (gatewayId) {
                const result = await checkTransactionStatusAndProcess(gatewayId);

                if (result && !result.alreadyPaid) {
                    console.log(`✅ Transaction ${result.transaction._id} processed successfully via webhook.`);
                    
                    await notificationService.sendMessage(EVENT_TYPES.WEBHOOK_PROCESSED, {
                        eventId,
                        eventType,
                        gatewayId,
                        amount: result.transaction.amount,
                        userId: result.user?._id
                    });

                    await WebhookEvent.findOneAndUpdate(
                        { eventId },
                        { status: 'processed' }
                    );
                } else if (result?.alreadyPaid) {
                    console.log(`ℹ️ Transaction ${gatewayId} already processed.`);
                    await WebhookEvent.findOneAndUpdate(
                        { eventId },
                        { status: 'processed' }
                    );
                } else {
                    console.log(`❌ No transaction found for gatewayId: ${gatewayId}`);
                    
                    await notificationService.sendMessage(EVENT_TYPES.WEBHOOK_FAILED, {
                        eventId,
                        eventType,
                        gatewayId,
                        error: 'Transaction not found'
                    });
                }
            }
        } else if (eventType === "withdraw.done") {
            const transaction = event?.data?.transaction;
            console.log(`💰 Saque realizado: ${transaction?.id}`);
            
            await notificationService.sendMessage(EVENT_TYPES.WITHDRAW_DONE, {
                eventId,
                transactionId: transaction?.id,
                amount: transaction?.amount,
                fee: transaction?.platformFee,
                receiptUrl: transaction?.receiptUrl
            });
            
            await WebhookEvent.findOneAndUpdate(
                { eventId },
                { status: 'processed' }
            );
        } else if (eventType === "withdraw.failed") {
            const transaction = event?.data?.transaction;
            console.log(`⚠️ Saque falhou: ${transaction?.id}`);
            
            await notificationService.sendMessage(EVENT_TYPES.WITHDRAW_FAILED, {
                eventId,
                transactionId: transaction?.id,
                amount: transaction?.amount,
                status: transaction?.status
            });
            
            await WebhookEvent.findOneAndUpdate(
                { eventId },
                { status: 'processed' }
            );
        }
    } catch (error) {
        console.error('Error in processWebhookEvent:', error);
        
        await notificationService.sendMessage(EVENT_TYPES.WEBHOOK_FAILED, {
            eventId,
            eventType,
            error: error.message
        });
        
        throw error;
    }
};