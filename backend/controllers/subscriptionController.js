import { getPlanById } from "../config/plans.js";
import Transaction from "../models/Transactions.js";
import axios from "axios";

export const createPaymentIntent = async (req, res) => {
    try {

        const { planId, customer } = req.body;

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

        // Salvar a transação no banco de dados
        const transaction = new Transaction({
            userId: customer.userId,
            amount: plan.amount,
            userId: customer.userId,
            gatewayId: abacatePayResponse.data?.id,
        });

        await transaction.save();

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