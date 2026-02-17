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
