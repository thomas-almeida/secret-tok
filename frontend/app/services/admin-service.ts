'use client';

import axios from "axios";

export const getUsersOverview = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/overview`);
    return response.data;
};

export const checkIsAdmin = async (userId: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/check-admin`, { userId });
    return response.data;
};

export const validateAdmin = async (userId: string, password: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/validate-admin`, { userId, password });
    return response.data;
};

export const setAdmin = async (userId: string, makeAdmin: boolean) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/set-admin`, { userId, makeAdmin });
    return response.data;
};

export type ContactStatus = 'a iniciar' | 'enviado' | 'respondido';
export type Funil = 'indiferente' | 'negativo' | 'positivo';

export const updateUserCRM = async (userId: string, contactStatus?: ContactStatus, funil?: Funil) => {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/update-crm`, { 
        userId, 
        contactStatus, 
        funil 
    });
    return response.data;
};
