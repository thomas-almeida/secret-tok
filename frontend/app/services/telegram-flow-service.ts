'use client';

import axios from "axios";
import {
    TelegramContact,
    TelegramFlow,
    TelegramFlowAudience,
    TelegramFlowFunnel,
    TelegramFlowRange,
    TelegramFlowRun,
    TelegramStep
} from "../schemas/telegram-flow-schema";

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

export const getFlowFunnel = async (flowId: string, range: TelegramFlowRange = '7d'): Promise<TelegramFlowFunnel> => {
    const response = await axios.get(`${BASE_URL}/${flowId}/funnel`, { params: { range } });
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

export const getAllContacts = async (
    params?: {
        search?: string;
        page?: number;
        limit?: number;
        flowSlug?: string;
        status?: 'in_progress' | 'waiting' | 'completed';
        activeFrom?: string;
        activeTo?: string;
    }
): Promise<{ contacts: TelegramContact[]; total: number; page: number; limit: number }> => {
    const response = await axios.get(`${BASE_URL}/contacts`, { params });
    return response.data;
};

export const getFlowAudience = async (flowId: string): Promise<TelegramFlowAudience> => {
    const response = await axios.get(`${BASE_URL}/${flowId}/audience`);
    return response.data;
};

export const setFlowAudience = async (flowId: string, chatIds: number[]): Promise<void> => {
    await axios.put(`${BASE_URL}/${flowId}/audience`, { chatIds });
};

export const dispatchFlow = async (flowId: string): Promise<{ queued: number }> => {
    const response = await axios.post(`${BASE_URL}/${flowId}/dispatch`);
    return response.data;
};
