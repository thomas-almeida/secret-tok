'use client';

import axios from "axios";

const ADMIN_USER_ID = '698ae31b9db23292cef56559';

export const getUsersOverview = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/overview`);
    return response.data;
};

export const validateAdmin = async (userId: string, password: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/validate-admin`, { userId, password });
    return response.data;
};

export const ADMIN_USER_ID_CONST = ADMIN_USER_ID;
