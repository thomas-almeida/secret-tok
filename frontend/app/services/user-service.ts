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

export const loginUser = async (phone: number, password: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/auth/login`, { phone, password });
    return response.data;
}