import { getPlanById } from "../config/plans.js";
import Transaction from "../models/Transactions.js";
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
            userId: customer.userId,
            gatewayId: abacatePayResponse.data?.data?.id,
            referenceId: referenceId
        });

        await transaction.save();

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
        console.log('Received webhook event:', event?.event);

        if (event.event === "billing.paid") {
            const gatewayId = event?.pixQrCode?.id;

            if (gatewayId) {
                const result = await checkTransactionStatusAndProcess(gatewayId);
                
                if (result && !result.alreadyPaid) {
                    console.log(`✅ Transaction ${result.transaction._id} processed successfully via webhook.`);
                } else if (result?.alreadyPaid) {
                    console.log(`ℹ️ Transaction ${gatewayId} already processed.`);
                } else {
                    console.log(`❌ No transaction found for gatewayId: ${gatewayId}`);
                }
            }
        }

        res.status(200).json({ received: true });

    } catch (error) {
        res.status(500).json({
            error: 'Error to process webhook',
            message: error.message
        })
    }
}