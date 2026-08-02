import crypto from "crypto";
import { getPlanById } from "../config/plans.js";
import Transaction from "../models/Transactions.js";
import WebhookEvent from "../models/WebhookEvent.js";
import axios from "axios";
import User from "../models/User.js";
import notificationService from '../services/notificationService.js';
import { EVENT_TYPES } from '../config/notificationEvents.js';
import { calculateAndApplyCommission, checkTransactionStatusAndProcess } from '../services/commissionService.js';
import Customer from "../models/Customer.js";

const NEXUSPAG_BASEURL = 'https://nexuspag.com';

export const createPaymentIntent = async (req, res) => {
    try {

        const { planId, customer, referenceId } = req.body;

        const plan = getPlanById(planId);

        if (!plan) {
            return res.status(400).json({ error: 'Invalid plan ID' });
        }

        let planAmount = plan.amount;

        // Verificar se o afiliado possui valores personalizados para os planos
        if (referenceId && referenceId !== "none") {
            const affiliateUser = await User.findById(referenceId);
            if (affiliateUser?.revenue?.customPlans) {
                planAmount = affiliateUser.revenue.customPlans[plan.id] || plan.amount;
            }
        }

        // NexusPag trabalha em REAIS (2 casas decimais); planAmount internamente é em centavos.
        const externalId = crypto.randomUUID();
        const paymentIntent = {
            amount: Number((planAmount / 100).toFixed(2)),
            expiration: 100000,
            description: plan.description,
            external_id: externalId,
            ...(process.env.PUBLIC_BASEURL && {
                webhook_url: `${process.env.PUBLIC_BASEURL}/api/auth/nexuspag-webhook`
            })
        };

        console.log(customer)

        const nexusPagResponse = await axios.post(
            `${NEXUSPAG_BASEURL}/api/pix/create`,
            paymentIntent,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXUSPAG_PROD
                }
            });

        const nexusPagTransaction = nexusPagResponse.data?.transaction;
        const gatewayId = nexusPagTransaction?.id;
        console.log('Creating transaction with gatewayId:', gatewayId);

        // Atualizar assinatura do usuário como pendente
        Customer.findByIdAndUpdate(customer?._id, {
            subscription: {
                planId: plan.planId,
                amount: planAmount,
                active: false,
                transactionDate: new Date()
            }
        }).exec();

        // Salvar a transação no banco de dados

        const transaction = new Transaction({
            userId: customer?.customerId,
            amount: planAmount,
            gatewayId: gatewayId,
            referenceId: referenceId
        });

        console.log(transaction.userId)

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
            paymentIntent: {
                id: nexusPagTransaction?.id,
                brCode: nexusPagTransaction?.pix_copia_cola,
                brCodeBase64: nexusPagTransaction?.qr_code_base64,
                status: nexusPagTransaction?.status?.toUpperCase(),
                expiresAt: nexusPagTransaction?.expires_at
            },
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

        const nexusPagResponse = await axios.get(
            `${NEXUSPAG_BASEURL}/api/pix/${gatewayId}`,
            {
                headers: {
                    'x-api-key': process.env.NEXUSPAG_PROD
                }
            })

        const gatewayStatus = nexusPagResponse.data?.status?.toUpperCase();

        if (gatewayStatus === 'PAID') {
            const result = await checkTransactionStatusAndProcess(gatewayId);

            if (!result) {
                return res.status(404).json({ error: 'Transaction not found or error processing' });
            }

            // Buscar o customer atualizado (subscription.active já deve estar true a essa altura)
            // para o front sincronizar a store local com o estado real do pagamento.
            const updatedCustomer = await Customer.findById(result.transaction.userId);

            if (result.alreadyPaid) {
                return res.status(200).json({
                    message: 'Transaction already processed',
                    transactionStatus: gatewayStatus,
                    customer: updatedCustomer
                });
            }

            console.log('Transaction processed successfully:', result);

            return res.status(200).json({
                message: 'Assinatura ativada com sucesso',
                transactionStatus: gatewayStatus,
                commissionData: result.commissionData,
                customer: updatedCustomer
            });
        }

        res.status(200).json({
            message: 'success',
            transactionStatus: gatewayStatus,
        });


    } catch (error) {
        res.status(500).json({
            error: 'Error to check transaction status',
            message: error.message
        })
    }

}

// Formato documentado pela NexusPag: header "t=<unix>,v1=<hmac>", assinando `${t}.${JSON.stringify(body)}`
const verifyNexusPagSignature = (signatureHeader, body) => {
    if (!signatureHeader || !process.env.WEBHOOK_SECRET) return false;

    const fields = Object.fromEntries(
        signatureHeader.split(',').map(part => part.split('='))
    );
    const payload = JSON.stringify(body);

    const expected = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(`${fields.t}.${payload}`)
        .digest('hex');

    const fresh = Math.abs(Date.now() / 1000 - Number(fields.t)) <= 300;
    const valid = fields.v1?.length === expected.length &&
        crypto.timingSafeEqual(
            Buffer.from(fields.v1, 'hex'),
            Buffer.from(expected, 'hex')
        );

    return fresh && valid;
};

export const webhookNexusPag = async (req, res) => {
    try {
        const signatureHeader = req.headers['x-nexuspag-signature'];

        if (!verifyNexusPagSignature(signatureHeader, req.body)) {
            return res.status(403).json({ error: 'Invalid webhook signature' });
        }

        const event = req.body;
        const eventType = event?.event;
        // A doc da NexusPag não especifica um id de entrega dedicado para o evento;
        // usamos o id do recurso (transação/saque) + tipo como chave de idempotência.
        const resourceId = event?.data?.id || event?.data?.txid || event?.data?.withdrawal_id;
        const eventId = event?.id || (resourceId ? `${eventType}:${resourceId}` : null);

        console.log('Received NexusPag webhook:', eventType, 'ID:', eventId, JSON.stringify(event?.data));

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
            gatewayId: resourceId,
            status: 'pending'
        });

        res.status(200).json({ received: true });

        processWebhookEvent(event, eventId).catch(async (error) => {
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

const processWebhookEvent = async (event, eventId) => {
    const eventType = event?.event;

    try {
        if (eventType === "payment.confirmed") {
            const gatewayId = event?.data?.id;
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
        } else if (eventType === "cashout.success") {
            const withdrawal = event?.data;
            console.log(`💰 Saque realizado: ${withdrawal?.withdrawal_id}`);

            await notificationService.sendMessage(EVENT_TYPES.WITHDRAW_DONE, {
                eventId,
                transactionId: withdrawal?.withdrawal_id,
                amount: withdrawal?.amount,
                fee: withdrawal?.fee
            });

            await WebhookEvent.findOneAndUpdate(
                { eventId },
                { status: 'processed' }
            );
        } else if (eventType === "cashout.failed") {
            const withdrawal = event?.data;
            console.log(`⚠️ Saque falhou: ${withdrawal?.withdrawal_id}`);

            await notificationService.sendMessage(EVENT_TYPES.WITHDRAW_FAILED, {
                eventId,
                transactionId: withdrawal?.withdrawal_id,
                amount: withdrawal?.amount,
                status: withdrawal?.status
            });

            await WebhookEvent.findOneAndUpdate(
                { eventId },
                { status: 'processed' }
            );
        } else if (eventType === "refund.completed") {
            const refund = event?.data;
            console.log(`↩️ Reembolso processado: ${refund?.id}`);

            await notificationService.sendMessage(EVENT_TYPES.WEBHOOK_PROCESSED, {
                eventId,
                eventType,
                gatewayId: refund?.id,
                amount: refund?.amount
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