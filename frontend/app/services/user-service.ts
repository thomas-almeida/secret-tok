import axios from "axios";

interface Subscription {
    amount?: number
    transactionDate: string
    isActive: boolean
}

interface Revenue {
    balance: number
    createdAt: string
    updatedAt: string
    associatedUsers: any[]
}

export const createUser = async (name: string, phone: number, email: string, password: string, subscription: Subscription, revenue: Revenue) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/create`, { name, phone, email, password, subscription, revenue });
    return response.data;
}

export const createCustomer = async (email: string, subscription: Subscription) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/customer`, { email, subscription });
    return response.data
}

export const loginUser = async (params: { phone?: number, password?: string, email?: string }) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/auth/login`, params);
    return response.data;
}

export const getAfiliateData = async (afiliateId: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/afiliate/${afiliateId}`)
    return response.data
}