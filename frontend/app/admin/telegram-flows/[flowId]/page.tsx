'use client';

import { useState, useEffect, useCallback, useRef, Suspense, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminAuthGate, { AdminAuthGateSkeleton } from "../../../components/admin-auth-gate";
import Logo from "../../../components/logo";
import Input from "../../../components/input";
import FlowMap from "./flow-map";
import {
    getFlow,
    updateFlow,
    getFlowFunnel,
    getFlowLeads,
    uploadFlowMedia
} from "../../../services/telegram-flow-service";
import {
    TelegramFlow,
    TelegramStepType,
    TelegramButtonKind,
    TelegramFlowFunnel,
    TelegramFlowRun
} from "../../../schemas/telegram-flow-schema";
import {
    Loader2, Plus, Trash2, ArrowUp, ArrowDown, Save, Copy, Check,
    ImageIcon, Video, Type, Link2, HelpCircle, Upload, BarChart3, ListChecks, Timer, Workflow
} from "lucide-react";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_FLOW_BOT_USERNAME || '';

interface EditableButton {
    label: string;
    kind: TelegramButtonKind;
    url?: string;
    goToStep?: number;
}

interface EditableStep {
    type: TelegramStepType;
    text?: string;
    mediaUrl?: string;
    delaySeconds: number;
    buttons: EditableButton[];
    waitForClick?: boolean;
    timeoutSeconds?: number;
    timeoutGoToStep?: number;
}

function emptyStep(): EditableStep {
    return { type: 'text', text: '', delaySeconds: 0, buttons: [] };
}

function FunnelPanel({ flowId }: { flowId: string }) {
    const [funnel, setFunnel] = useState<TelegramFlowFunnel | null>(null);
    const [leads, setLeads] = useState<TelegramFlowRun[]>([]);
    const [statusFilter, setStatusFilter] = useState<'' | 'in_progress' | 'waiting' | 'completed'>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [funnelData, leadsData] = await Promise.all([
                getFlowFunnel(flowId),
                getFlowLeads(flowId, statusFilter ? { status: statusFilter, limit: 100 } : { limit: 100 })
            ]);
            setFunnel(funnelData);
            setLeads(leadsData.leads);
        } catch (err) {
            console.error('Error loading funnel:', err);
        } finally {
            setIsLoading(false);
        }
    }, [flowId, statusFilter]);

    useEffect(() => {
        load();
    }, [load]);

    if (isLoading && !funnel) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!funnel) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                    <p className="text-sm text-neutral-400">Total de leads</p>
                    <p className="text-2xl font-bold">{funnel.totalRuns}</p>
                </div>
                <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                    <p className="text-sm text-neutral-400">Completaram o fluxo</p>
                    <p className="text-2xl font-bold">{funnel.completedRuns}</p>
                </div>
                <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                    <p className="text-sm text-neutral-400">Taxa de conclusão</p>
                    <p className="text-2xl font-bold">{(funnel.completionRate * 100).toFixed(0)}%</p>
                </div>
            </div>

            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Funil por passo</h3>
                <div className="space-y-3">
                    {funnel.steps.map((step) => {
                        const pct = funnel.totalRuns > 0 ? Math.round((step.reached / funnel.totalRuns) * 100) : 0;
                        return (
                            <div key={step.order}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-neutral-300">Passo {step.order + 1} · {step.label}</span>
                                    <span className="text-neutral-400">{step.reached} leads ({pct}%)</span>
                                </div>
                                <div className="w-full h-3 bg-neutral-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                    {funnel.steps.length === 0 && (
                        <p className="text-neutral-400 text-sm">Adicione passos ao fluxo para ver o funil.</p>
                    )}
                </div>
            </div>

            {funnel.buttonClicks.length > 0 && (
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Cliques em botões (quiz)</h3>
                    <p className="text-xs text-neutral-500 mb-3">Usuários únicos que clicaram — não conta cliques repetidos da mesma pessoa</p>
                    <div className="space-y-2">
                        {funnel.buttonClicks.map((click, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-neutral-300">Passo {click.stepOrder + 1} · {click.buttonLabel}</span>
                                <span className="text-neutral-400">{click.count} usuário(s)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Leads</h3>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as '' | 'in_progress' | 'waiting' | 'completed')}
                        className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value="">Todos</option>
                        <option value="waiting">Esperando clique</option>
                        <option value="in_progress">Em andamento</option>
                        <option value="completed">Completou</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-700/50">
                            <tr>
                                <th className="text-left p-3 text-neutral-300">Lead</th>
                                <th className="text-left p-3 text-neutral-300">Passo atual</th>
                                <th className="text-left p-3 text-neutral-300">Status</th>
                                <th className="text-left p-3 text-neutral-300">Início</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {leads.map((lead) => (
                                <tr key={lead._id}>
                                    <td className="p-3">{lead.username ? `@${lead.username}` : (lead.firstName || lead.chatId)}</td>
                                    <td className="p-3">{lead.maxStepOrderReached + 1}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${lead.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                lead.status === 'waiting' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {lead.status === 'completed' ? 'Completou' : lead.status === 'waiting' ? 'Esperando clique' : 'Em andamento'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-neutral-400">{new Date(lead.startedAt).toLocaleString('pt-BR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {leads.length === 0 && (
                        <div className="text-center py-8 text-neutral-400 text-sm">Nenhum lead ainda.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FlowEditorContent({ userId, flowId }: { userId: string; flowId: string }) {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') === 'funnel' ? 'funnel' : 'editor';

    const [tab, setTab] = useState<'editor' | 'map' | 'funnel'>(initialTab);
    const [pendingScrollIndex, setPendingScrollIndex] = useState<number | null>(null);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [flow, setFlow] = useState<TelegramFlow | null>(null);
    const [name, setName] = useState<string>('');
    const [slug, setSlug] = useState<string>('');
    const [active, setActive] = useState<boolean>(true);
    const [steps, setSteps] = useState<EditableStep[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [copied, setCopied] = useState<boolean>(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const data = await getFlow(flowId);
                setFlow(data);
                setName(data.name);
                setSlug(data.slug);
                setActive(data.active);
                setSteps(
                    [...data.steps]
                        .sort((a, b) => a.order - b.order)
                        .map((s) => ({
                            type: s.type,
                            text: s.text,
                            mediaUrl: s.mediaUrl,
                            delaySeconds: s.delaySeconds,
                            waitForClick: s.waitForClick,
                            timeoutSeconds: s.timeoutSeconds,
                            timeoutGoToStep: s.timeoutGoToStep,
                            buttons: s.buttons.map((b) => ({ label: b.label, kind: b.kind, url: b.url, goToStep: b.goToStep }))
                        }))
                );
            } catch (err) {
                console.error('Error loading flow:', err);
                setError('Erro ao carregar fluxo');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [flowId]);

    const updateStep = (index: number, patch: Partial<EditableStep>) => {
        setSteps((prev) => prev.map((s, i) => i === index ? { ...s, ...patch } : s));
    };

    const addStep = () => setSteps((prev) => [...prev, emptyStep()]);

    const removeStep = (index: number) => setSteps((prev) => prev.filter((_, i) => i !== index));

    const moveStep = (index: number, direction: -1 | 1) => {
        setSteps((prev) => {
            const target = index + direction;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const addButton = (stepIndex: number) => {
        updateStep(stepIndex, {
            buttons: [...steps[stepIndex].buttons, { label: '', kind: 'url', url: '' }]
        });
    };

    const updateButton = (stepIndex: number, buttonIndex: number, patch: Partial<EditableButton>) => {
        const buttons = steps[stepIndex].buttons.map((b, i) => i === buttonIndex ? { ...b, ...patch } : b);
        updateStep(stepIndex, { buttons });
    };

    const removeButton = (stepIndex: number, buttonIndex: number) => {
        updateStep(stepIndex, { buttons: steps[stepIndex].buttons.filter((_, i) => i !== buttonIndex) });
    };

    const handleMediaUpload = async (stepIndex: number, file: File) => {
        setUploadingIndex(stepIndex);
        try {
            const url = await uploadFlowMedia(file);
            updateStep(stepIndex, { mediaUrl: url });
        } catch (err) {
            console.error('Error uploading media:', err);
            setError('Falha ao enviar arquivo. Cole a URL manualmente.');
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleSave = async () => {
        if (!name || !slug) {
            setError('Preencha nome e slug');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const payload = steps.map((s, i) => ({ ...s, order: i }));
            const updated = await updateFlow(flowId, { name, slug, active, steps: payload });
            setFlow(updated);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Erro ao salvar fluxo');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (tab === 'editor' && pendingScrollIndex !== null) {
            const index = pendingScrollIndex;
            // Double rAF: espera o navegador terminar de assentar o layout (e qualquer
            // ajuste de foco/scroll da aba do mapa desmontando) antes de rolar até o passo.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    stepRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            });
            setPendingScrollIndex(null);
        }
    }, [tab, pendingScrollIndex]);

    const handleSelectStepFromMap = (index: number) => {
        setTab('editor');
        setPendingScrollIndex(index);
    };

    const copyDeepLink = async () => {
        if (!BOT_USERNAME) return;
        try {
            await navigator.clipboard.writeText(`https://t.me/${BOT_USERNAME}?start=${slug}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!flow) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-400">
                Fluxo não encontrado.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <div className="w-full flex justify-between items-center font-semibold p-2 py-4 lg:px-54">
                <Logo />
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/telegram-flows?ref=${userId}`}
                        className="px-4 py-2 bg-black/50 hover:bg-black/70 rounded-md text-lg text-slate-200"
                    >
                        Voltar
                    </Link>
                </div>
            </div>

            <div className="pt-10 max-w-4xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Nome</label>
                            <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Slug</label>
                            <Input value={slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <label className="flex items-center gap-2 text-sm text-neutral-300">
                        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-amber-500" />
                        Fluxo ativo
                    </label>

                    {BOT_USERNAME && (
                        <button
                            onClick={copyDeepLink}
                            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm hover:bg-neutral-700 transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            t.me/{BOT_USERNAME}?start={slug}
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-600 rounded-lg font-semibold transition-colors"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar
                    </button>
                </div>

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <div className="flex gap-2 mb-6 border-b border-neutral-800">
                    <button
                        onClick={() => setTab('editor')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'editor' ? 'border-amber-500 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
                    >
                        <ListChecks className="w-4 h-4" /> Passos
                    </button>
                    <button
                        onClick={() => setTab('map')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'map' ? 'border-amber-500 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
                    >
                        <Workflow className="w-4 h-4" /> Mapa
                    </button>
                    <button
                        onClick={() => setTab('funnel')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'funnel' ? 'border-amber-500 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
                    >
                        <BarChart3 className="w-4 h-4" /> Funil
                    </button>
                </div>

                {tab === 'funnel' ? (
                    <FunnelPanel flowId={flowId} />
                ) : tab === 'map' ? (
                    <FlowMap steps={steps} onSelectStep={handleSelectStepFromMap} />
                ) : (
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                ref={(el) => { stepRefs.current[index] = el; }}
                                className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 scroll-mt-24"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <p className="font-semibold text-neutral-300">Passo {index + 1}</p>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => moveStep(index, -1)} disabled={index === 0} className="p-1.5 hover:bg-neutral-700 rounded disabled:opacity-30">
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} className="p-1.5 hover:bg-neutral-700 rounded disabled:opacity-30">
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => removeStep(index)} className="p-1.5 hover:bg-red-900/30 rounded">
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">Tipo</label>
                                        <div className="flex gap-2">
                                            {(['text', 'photo', 'video'] as TelegramStepType[]).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => updateStep(index, { type })}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border ${step.type === type ? 'bg-amber-600 border-amber-600 text-white' : 'bg-neutral-700 border-neutral-600 text-neutral-300'}`}
                                                >
                                                    {type === 'text' && <Type className="w-4 h-4" />}
                                                    {type === 'photo' && <ImageIcon className="w-4 h-4" />}
                                                    {type === 'video' && <Video className="w-4 h-4" />}
                                                    {type === 'text' ? 'Texto' : type === 'photo' ? 'Foto' : 'Vídeo'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-2">Espera antes de enviar (segundos)</label>
                                        <Input
                                            type="number"
                                            value={String(step.delaySeconds)}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(index, { delaySeconds: Number(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                {step.type !== 'text' && (
                                    <div className="mb-3">
                                        <label className="block text-sm text-neutral-400 mb-2">URL da mídia ({step.type === 'photo' ? 'imagem' : 'vídeo'})</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="https://..."
                                                value={step.mediaUrl || ''}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(index, { mediaUrl: e.target.value })}
                                            />
                                            <label className="flex items-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm cursor-pointer whitespace-nowrap">
                                                {uploadingIndex === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                Enviar
                                                <input
                                                    type="file"
                                                    accept={step.type === 'photo' ? 'image/*' : 'video/*'}
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleMediaUpload(index, file);
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {step.mediaUrl && (
                                            step.type === 'photo' ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={step.mediaUrl}
                                                    alt="Preview da imagem"
                                                    className="mt-2 max-h-56 rounded-lg border border-neutral-700 object-contain"
                                                />
                                            ) : (
                                                <video
                                                    src={step.mediaUrl}
                                                    controls
                                                    className="mt-2 max-h-56 rounded-lg border border-neutral-700"
                                                />
                                            )
                                        )}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="block text-sm text-neutral-400 mb-2">
                                        {step.type === 'text' ? 'Texto' : 'Legenda (opcional)'}
                                        <span className="text-neutral-500 font-normal"> — **assim** para negrito · {'{{nome}}'} e {'{{username}}'} para personalizar</span>
                                    </label>
                                    <textarea
                                        value={step.text || ''}
                                        onChange={(e) => updateStep(index, { text: e.target.value })}
                                        rows={3}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white placeholder:text-neutral-500 outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm text-neutral-400">Botões</label>
                                        <button onClick={() => addButton(index)} className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400">
                                            <Plus className="w-3.5 h-3.5" /> Adicionar botão
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {step.buttons.map((button, buttonIndex) => (
                                            <div key={buttonIndex} className="flex flex-col md:flex-row gap-2 bg-neutral-900 border border-neutral-700 rounded-lg p-2">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => updateButton(index, buttonIndex, { kind: 'url' })}
                                                        className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs ${button.kind === 'url' ? 'bg-amber-600 text-white' : 'bg-neutral-700 text-neutral-300'}`}
                                                    >
                                                        <Link2 className="w-3.5 h-3.5" /> Link
                                                    </button>
                                                    <button
                                                        onClick={() => updateButton(index, buttonIndex, { kind: 'quiz' })}
                                                        className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs ${button.kind === 'quiz' ? 'bg-amber-600 text-white' : 'bg-neutral-700 text-neutral-300'}`}
                                                    >
                                                        <HelpCircle className="w-3.5 h-3.5" /> Quiz
                                                    </button>
                                                </div>
                                                <Input
                                                    placeholder="Rótulo do botão"
                                                    value={button.label}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateButton(index, buttonIndex, { label: e.target.value })}
                                                    className="flex-1"
                                                />
                                                {button.kind === 'url' && (
                                                    <Input
                                                        placeholder="https://..."
                                                        value={button.url || ''}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateButton(index, buttonIndex, { url: e.target.value })}
                                                        className="flex-1"
                                                    />
                                                )}
                                                {button.kind === 'quiz' && (
                                                    <select
                                                        value={button.goToStep !== undefined ? String(button.goToStep) : ''}
                                                        onChange={(e) => updateButton(index, buttonIndex, { goToStep: e.target.value === '' ? undefined : Number(e.target.value) })}
                                                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm text-neutral-300"
                                                    >
                                                        <option value="">Ao clicar: próximo passo</option>
                                                        {steps.map((_, stepOption) => (
                                                            <option key={stepOption} value={stepOption}>Ao clicar: ir para Passo {stepOption + 1}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                <button onClick={() => removeButton(index, buttonIndex)} className="p-2 hover:bg-red-900/30 rounded self-start">
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {step.buttons.some((b) => b.kind === 'quiz') && (
                                        <div className="mt-3 p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                                            <label className="flex items-center gap-2 text-sm text-neutral-300 mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={step.waitForClick || false}
                                                    onChange={(e) => updateStep(index, { waitForClick: e.target.checked })}
                                                    className="accent-amber-500"
                                                />
                                                <Timer className="w-4 h-4" />
                                                Pausar aqui e esperar clique num botão quiz
                                            </label>

                                            {step.waitForClick && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                                    <div>
                                                        <label className="block text-xs text-neutral-400 mb-1">Timeout (segundos, opcional)</label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Espera pra sempre se vazio"
                                                            value={step.timeoutSeconds !== undefined ? String(step.timeoutSeconds) : ''}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(index, { timeoutSeconds: e.target.value === '' ? undefined : Number(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-neutral-400 mb-1">Se ninguém clicar, ir para</label>
                                                        <select
                                                            value={step.timeoutGoToStep !== undefined ? String(step.timeoutGoToStep) : ''}
                                                            onChange={(e) => updateStep(index, { timeoutGoToStep: e.target.value === '' ? undefined : Number(e.target.value) })}
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-2 text-sm text-neutral-300"
                                                        >
                                                            <option value="">Próximo passo</option>
                                                            {steps.map((_, stepOption) => (
                                                                <option key={stepOption} value={stepOption}>Passo {stepOption + 1}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addStep}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-800 border border-dashed border-neutral-700 hover:border-amber-500 rounded-lg text-neutral-300 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Adicionar passo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function FlowEditorPageInner({ flowId }: { flowId: string }) {
    return (
        <AdminAuthGate>
            {(userId) => <FlowEditorContent userId={userId} flowId={flowId} />}
        </AdminAuthGate>
    );
}

export default function FlowEditorPage({ params }: { params: Promise<{ flowId: string }> }) {
    const { flowId } = use(params);

    return (
        <Suspense fallback={<AdminAuthGateSkeleton />}>
            <FlowEditorPageInner flowId={flowId} />
        </Suspense>
    );
}
