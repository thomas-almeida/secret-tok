'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import AdminAuthGate, { AdminAuthGateSkeleton } from "../../components/admin-auth-gate";
import Logo from "../../components/logo";
import Input from "../../components/input";
import { getFlows, createFlow, deleteFlow } from "../../services/telegram-flow-service";
import { TelegramFlow } from "../../schemas/telegram-flow-schema";
import { Loader2, Plus, Trash2, Copy, Check, Pencil, MessageCircle, BarChart3 } from "lucide-react";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_FLOW_BOT_USERNAME || '';

function slugify(value: string) {
    return value
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function deepLinkFor(slug: string) {
    if (!BOT_USERNAME) return '';
    return `https://t.me/${BOT_USERNAME}?start=${slug}`;
}

function TelegramFlowsListContent({ userId }: { userId: string }) {
    const [flows, setFlows] = useState<TelegramFlow[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [name, setName] = useState<string>('');
    const [slug, setSlug] = useState<string>('');
    const [slugTouched, setSlugTouched] = useState<boolean>(false);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchFlows();
    }, []);

    const fetchFlows = async () => {
        setIsLoading(true);
        try {
            const data = await getFlows();
            setFlows(data);
        } catch (err) {
            console.error('Error fetching telegram flows:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!name || !slug) {
            setError('Preencha nome e slug do fluxo');
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            await createFlow(name, slug);
            setName('');
            setSlug('');
            setSlugTouched(false);
            fetchFlows();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Erro ao criar fluxo');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (flowId: string) => {
        setDeletingId(flowId);
        try {
            await deleteFlow(flowId);
            setFlows(flows.filter(f => f._id !== flowId));
        } catch (err) {
            console.error('Error deleting flow:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const copyDeepLink = async (slugValue: string) => {
        try {
            await navigator.clipboard.writeText(deepLinkFor(slugValue));
            setCopiedSlug(slugValue);
            setTimeout(() => setCopiedSlug(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <div className="w-full flex justify-between items-center font-semibold p-2 py-4 lg:px-54">
                <Logo />
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin?ref=${userId}`}
                        className="px-4 py-2 bg-black/50 hover:bg-black/70 rounded-md text-lg text-slate-200"
                    >
                        Voltar
                    </Link>
                </div>
            </div>

            <div className="pt-10 max-w-5xl mx-auto px-4 py-6">
                <div className="flex items-center gap-3 mb-6">
                    <MessageCircle className="w-6 h-6 text-amber-500" />
                    <h1 className="text-2xl font-bold">Fluxos de Telegram</h1>
                </div>

                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Criar novo fluxo</h2>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                            <label className="block text-sm text-neutral-400 mb-2">Nome</label>
                            <Input
                                placeholder="Ex: Promoção Verão"
                                value={name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setName(e.target.value);
                                    if (!slugTouched) setSlug(slugify(e.target.value));
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-neutral-400 mb-2">Slug (usado no link)</label>
                            <Input
                                placeholder="promocao-verao"
                                value={slug}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setSlugTouched(true);
                                    setSlug(slugify(e.target.value));
                                }}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleCreate}
                                disabled={isCreating}
                                className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                Criar
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    {!BOT_USERNAME && (
                        <p className="text-amber-400/80 text-xs mt-3">
                            Configure NEXT_PUBLIC_TELEGRAM_FLOW_BOT_USERNAME para gerar os links de início dos fluxos.
                        </p>
                    )}
                </div>

                <div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-neutral-700">
                        <h2 className="text-lg font-semibold">Fluxos</h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        </div>
                    ) : flows.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400">
                            Nenhum fluxo criado ainda.
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-700">
                            {flows.map((flow) => (
                                <div key={flow._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{flow.name}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${flow.active ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700 text-neutral-400'}`}>
                                                {flow.active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-400">{flow.steps.length} passo(s) · /start {flow.slug}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {BOT_USERNAME && (
                                            <button
                                                onClick={() => copyDeepLink(flow.slug)}
                                                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                                                title="Copiar link de início"
                                            >
                                                {copiedSlug === flow.slug ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                                            </button>
                                        )}
                                        <Link
                                            href={`/admin/telegram-flows/${flow._id}?ref=${userId}`}
                                            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                                            title="Editar / ver funil"
                                        >
                                            <Pencil className="w-4 h-4 text-neutral-300" />
                                        </Link>
                                        <Link
                                            href={`/admin/telegram-flows/${flow._id}?ref=${userId}&tab=funnel`}
                                            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                                            title="Ver funil"
                                        >
                                            <BarChart3 className="w-4 h-4 text-neutral-300" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(flow._id)}
                                            disabled={deletingId === flow._id}
                                            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
                                            title="Deletar fluxo"
                                        >
                                            {deletingId === flow._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TelegramFlowsPageInner() {
    return (
        <AdminAuthGate>
            {(userId) => <TelegramFlowsListContent userId={userId} />}
        </AdminAuthGate>
    );
}

export default function TelegramFlowsPage() {
    return (
        <Suspense fallback={<AdminAuthGateSkeleton />}>
            <TelegramFlowsPageInner />
        </Suspense>
    );
}
