import axios from 'axios';

interface PaymentIntenPayload {
    planId: string;
    customer: {
        name: string;
        cellphone: string;
        email: string;
        userId: string;
    }
}

export const createPaymentIntent = async (payload: PaymentIntenPayload) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/auth/create-payment-intent`, payload);
    return response.data;
}

export const checkTransactionStatus = async (gatewayId: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/auth/check-transaction/${gatewayId}`);
    return response.data;
}