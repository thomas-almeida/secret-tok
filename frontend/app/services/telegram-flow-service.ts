'use client';

import axios from "axios";
import { TelegramFlow, TelegramFlowFunnel, TelegramFlowRun, TelegramStep } from "../schemas/telegram-flow-schema";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/telegram-flows`;

export const getFlows = async (): Promise<TelegramFlow[]> => {
    const response = await axios.get(BASE_URL);
    return response.data.flows;
};

export const getFlow = async (flowId: string): Promise<TelegramFlow> => {
    const response = await axios.get(`${BASE_URL}/${flowId}`);
    return response.data.flow;
};

export const createFlow = async (name: string, slug: string): Promise<TelegramFlow> => {
    const response = await axios.post(`${BASE_URL}/create`, { name, slug });
    return response.data.flow;
};

export const updateFlow = async (
    flowId: string,
    data: Partial<{ name: string; slug: string; active: boolean; steps: TelegramStep[] }>
): Promise<TelegramFlow> => {
    const response = await axios.put(`${BASE_URL}/${flowId}`, data);
    return response.data.flow;
};

export const deleteFlow = async (flowId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${flowId}`);
};

export const getFlowFunnel = async (flowId: string): Promise<TelegramFlowFunnel> => {
    const response = await axios.get(`${BASE_URL}/${flowId}/funnel`);
    return response.data;
};

export const getFlowLeads = async (
    flowId: string,
    params?: { status?: 'in_progress' | 'waiting' | 'completed'; minStep?: number; page?: number; limit?: number }
): Promise<{ leads: TelegramFlowRun[]; total: number; page: number; limit: number }> => {
    const response = await axios.get(`${BASE_URL}/${flowId}/leads`, { params });
    return response.data;
};

export const uploadFlowMedia = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${BASE_URL}/upload-media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
};
