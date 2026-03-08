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

export const updateCustomPlans = async (userId: string, lifetime: number, monthly: number) => {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/${userId}/custom-plans`, { lifetime, monthly });
    return response.data;
};

export const updateCustomModel = async (userId: string, modelData: { username: string; displayName: string; description: string; profilePicture: string; coverPicture: string }) => {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/${userId}/custom-model`, modelData);
    return response.data;
};

export const getModelByUsername = async (username: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/model/${username}`);
    return response.data;
};

export const registerSession = async (userId: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/${userId}/register-session`);
    return response.data;
};

export const createModelTransaction = async (userId: string, modelUsername: string, amount: number, planType: 'lifetime' | 'monthly') => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/${userId}/model-transaction`, {
        modelUsername,
        amount,
        planType
    });
    return response.data;
};