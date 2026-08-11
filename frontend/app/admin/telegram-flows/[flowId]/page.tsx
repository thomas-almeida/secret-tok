'use client';

import { useState, useEffect, useCallback, useRef, Suspense, use, Fragment } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminAuthGate, { AdminAuthGateSkeleton } from "../../../components/admin-auth-gate";
import Logo from "../../../components/logo";
import Input from "../../../components/input";
import FlowMap from "./flow-map";
import {
    getFlow,
    getFlows,
    updateFlow,
    getFlowFunnel,
    getFlowLeads,
    uploadFlowMedia,
    getAllContacts,
    getFlowAudience,
    setFlowAudience,
    dispatchFlow
} from "../../../services/telegram-flow-service";
import {
    TelegramFlow,
    TelegramStepType,
    TelegramButtonKind,
    TelegramFlowFunnel,
    TelegramFlowRange,
    TelegramFlowRun,
    TelegramContact,
    TelegramRemarketingStatus,
    TelegramRemarketingCounts
} from "../../../schemas/telegram-flow-schema";
import {
    Loader2, Plus, Trash2, ArrowUp, ArrowDown, Save, Copy, Check,
    ImageIcon, Video, Type, Link2, HelpCircle, Upload, BarChart3, ListChecks, Timer, Workflow,
    Users, Clock, TrendingUp, MousePointerClick, Search
} from "lucide-react";
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell
} from "recharts";

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

function formatDuration(totalSeconds: number | null): string {
    if (totalSeconds === null || Number.isNaN(totalSeconds)) return '—';
    const seconds = Math.round(totalSeconds);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min`;
}

const STATUS_COLORS: Record<string, string> = {
    completed: '#22c55e',
    waiting: '#f59e0b',
    in_progress: '#3b82f6'
};

const STATUS_LABELS: Record<string, string> = {
    completed: 'Completou',
    waiting: 'Esperando clique',
    in_progress: 'Em andamento'
};

const RANGE_OPTIONS: { value: TelegramFlowRange; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: 'all', label: 'All' }
];

function formatBucketLabel(bucket: string, granularity: 'hour' | 'day'): string {
    if (granularity === 'hour') {
        return bucket.slice(-5); // "HH:00"
    }
    const [, month, day] = bucket.split('-');
    return `${day}/${month}`;
}

function FunnelPanel({ flowId }: { flowId: string }) {
    const [funnel, setFunnel] = useState<TelegramFlowFunnel | null>(null);
    const [leads, setLeads] = useState<TelegramFlowRun[]>([]);
    const [statusFilter, setStatusFilter] = useState<'' | 'in_progress' | 'waiting' | 'completed'>('');
    const [range, setRange] = useState<TelegramFlowRange>('7d');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [funnelData, leadsData] = await Promise.all([
                getFlowFunnel(flowId, range),
                getFlowLeads(flowId, statusFilter ? { status: statusFilter, limit: 100 } : { limit: 100 })
            ]);
            setFunnel(funnelData);
            setLeads(leadsData.leads);
        } catch (err) {
            console.error('Error loading funnel:', err);
        } finally {
            setIsLoading(false);
        }
    }, [flowId, statusFilter, range]);

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

    const pieData = (['completed', 'waiting', 'in_progress'] as const)
        .map((key) => ({ key, value: funnel.statusBreakdown[key] }))
        .filter((d) => d.value > 0);

    const peakHour = funnel.leadsByHour.reduce((max, h) => (h.count > max.count ? h : max), funnel.leadsByHour[0]);
    const hasHourData = funnel.leadsByHour.some((h) => h.count > 0);
    const clickRate = funnel.totalRuns > 0 ? funnel.uniqueUrlClickers / funnel.totalRuns : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Visão geral</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Métricas do período selecionado</p>
                </div>
                <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded-lg p-1">
                    {RANGE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setRange(opt.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${range === opt.value ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Leads no período</p>
                    <p className="text-2xl font-bold mt-1">{funnel.totalRuns}</p>
                </div>
                <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Completaram</p>
                    <p className="text-2xl font-bold mt-1">{funnel.completedRuns}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{(funnel.completionRate * 100).toFixed(0)}% de conclusão</p>
                </div>
                <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" />Clicaram p/ assistir</p>
                    <p className="text-2xl font-bold mt-1">{funnel.uniqueUrlClickers}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{(clickRate * 100).toFixed(0)}% dos leads</p>
                </div>
                <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5"><MousePointerClick className="w-3.5 h-3.5" />Tempo até clicar</p>
                    <p className="text-2xl font-bold mt-1">{formatDuration(funnel.avgTimeToClickSeconds)}</p>
                </div>
                <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Tempo até completar</p>
                    <p className="text-2xl font-bold mt-1">{formatDuration(funnel.avgCompletionTimeSeconds)}</p>
                </div>
                <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" />Horário de pico</p>
                    <p className="text-2xl font-bold mt-1">{hasHourData ? `${String(peakHour.hour).padStart(2, '0')}h` : '—'}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{hasHourData ? `${peakHour.count} leads nesse horário` : 'sem dados'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Leads novos {funnel.timeSeries.granularity === 'hour' ? '(por hora, últimas 24h)' : `(por dia, ${range === 'all' ? 'todo o período' : range})`}</h3>
                    {funnel.timeSeries.points.every((d) => d.count === 0) ? (
                        <p className="text-neutral-400 text-sm py-8 text-center">Sem entradas nesse período.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={funnel.timeSeries.points}>
                                <defs>
                                    <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                                <XAxis
                                    dataKey="bucket"
                                    tickFormatter={(d: string) => formatBucketLabel(d, funnel.timeSeries.granularity)}
                                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                                    axisLine={{ stroke: '#404040' }}
                                    tickLine={false}
                                    minTickGap={20}
                                />
                                <YAxis allowDecimals={false} tick={{ fill: '#a3a3a3', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                                <Tooltip
                                    contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8, fontSize: 12 }}
                                    labelFormatter={(d) => formatBucketLabel(String(d), funnel.timeSeries.granularity)}
                                    formatter={(value) => [value, 'Leads']}
                                />
                                <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fill="url(#leadsGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Status atual dos leads</h3>
                    {pieData.length === 0 ? (
                        <p className="text-neutral-400 text-sm py-8 text-center">Sem leads ainda.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="key" innerRadius={45} outerRadius={70} paddingAngle={2}>
                                        {pieData.map((d) => <Cell key={d.key} fill={STATUS_COLORS[d.key]} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8, fontSize: 12 }}
                                        formatter={(value, _name, entry) => [value, STATUS_LABELS[String((entry as { payload?: { key?: string } })?.payload?.key)]]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {pieData.map((d) => (
                                    <div key={d.key} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-neutral-300">
                                            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[d.key] }} />
                                            {STATUS_LABELS[d.key]}
                                        </span>
                                        <span className="text-neutral-400">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-1">Horários de pico</h3>
                <p className="text-xs text-neutral-500 mb-4">Soma de leads por hora do dia (horário de Brasília), no período selecionado</p>
                {!hasHourData ? (
                    <p className="text-neutral-400 text-sm py-8 text-center">Sem dados suficientes nesse período.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={funnel.leadsByHour}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                            <XAxis
                                dataKey="hour"
                                tickFormatter={(h: number) => `${h}h`}
                                tick={{ fill: '#a3a3a3', fontSize: 10 }}
                                axisLine={{ stroke: '#404040' }}
                                tickLine={false}
                                interval={1}
                            />
                            <YAxis allowDecimals={false} tick={{ fill: '#a3a3a3', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                            <Tooltip
                                contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8, fontSize: 12 }}
                                labelFormatter={(h) => `${h}h - ${Number(h) + 1}h`}
                                formatter={(value) => [value, 'Leads']}
                            />
                            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                                {funnel.leadsByHour.map((h) => (
                                    <Cell key={h.hour} fill={h.hour === peakHour.hour ? '#f59e0b' : '#525252'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
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

            {funnel.ctaStats.length > 0 && (
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-neutral-700">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><MousePointerClick className="w-4 h-4" />Performance dos CTAs</h3>
                        <p className="text-xs text-neutral-500 mt-1">CTR = cliques únicos ÷ leads que alcançaram o passo. Inclui botões de quiz e de link (assistir/acessar).</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-700/50">
                                <tr>
                                    <th className="text-left p-3 text-neutral-300">Passo</th>
                                    <th className="text-left p-3 text-neutral-300">Botão</th>
                                    <th className="text-left p-3 text-neutral-300">Tipo</th>
                                    <th className="text-left p-3 text-neutral-300">Alcançaram</th>
                                    <th className="text-left p-3 text-neutral-300">Cliques únicos</th>
                                    <th className="text-left p-3 text-neutral-300">CTR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700">
                                {funnel.ctaStats.map((cta, i) => (
                                    <tr key={i}>
                                        <td className="p-3 text-neutral-300">{cta.stepOrder + 1}</td>
                                        <td className="p-3 text-neutral-300">{cta.buttonLabel}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${cta.buttonKind === 'url' ? 'bg-sky-500/20 text-sky-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {cta.buttonKind === 'url' ? 'link' : 'quiz'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-neutral-400">{cta.reached}</td>
                                        <td className="p-3 text-neutral-400">{cta.count}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500" style={{ width: `${Math.min(cta.ctr * 100, 100)}%` }} />
                                                </div>
                                                <span className="text-neutral-300 text-xs">{(cta.ctr * 100).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                <th className="text-left p-3 text-neutral-300">Entrada</th>
                                <th className="text-left p-3 text-neutral-300">Cliques</th>
                                <th className="text-left p-3 text-neutral-300"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {leads.map((lead) => {
                                const isExpanded = expandedLeadId === lead._id;
                                const entryDate = new Date(lead.startedAt);
                                return (
                                    <Fragment key={lead._id}>
                                        <tr
                                            className="cursor-pointer hover:bg-neutral-700/30"
                                            onClick={() => setExpandedLeadId(isExpanded ? null : lead._id)}
                                        >
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
                                            <td className="p-3 text-neutral-400">
                                                <div>{entryDate.toLocaleDateString('pt-BR')}</div>
                                                <div className="text-xs text-neutral-500">{entryDate.toLocaleTimeString('pt-BR')}</div>
                                            </td>
                                            <td className="p-3 text-neutral-400">{lead.buttonClicks.length}</td>
                                            <td className="p-3 text-neutral-500 text-xs">{isExpanded ? '▲ fechar' : '▼ detalhes'}</td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-neutral-900/60">
                                                <td colSpan={6} className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <p className="text-neutral-500 mb-1">Chat ID</p>
                                                            <p className="text-neutral-300">{lead.chatId}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-neutral-500 mb-1">Entrou no fluxo</p>
                                                            <p className="text-neutral-300">{entryDate.toLocaleString('pt-BR')}</p>
                                                        </div>
                                                        {lead.status === 'completed' && lead.completedAt && (
                                                            <div>
                                                                <p className="text-neutral-500 mb-1">Completou o fluxo</p>
                                                                <p className="text-neutral-300">{new Date(lead.completedAt).toLocaleString('pt-BR')}</p>
                                                            </div>
                                                        )}
                                                        {lead.status === 'waiting' && lead.waitingUntil && (
                                                            <div>
                                                                <p className="text-neutral-500 mb-1">Timeout em</p>
                                                                <p className="text-neutral-300">{new Date(lead.waitingUntil).toLocaleString('pt-BR')}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-4">
                                                        <p className="text-neutral-500 mb-2 text-xs">Cliques em CTAs</p>
                                                        {lead.buttonClicks.length === 0 ? (
                                                            <p className="text-neutral-600 text-xs">Nenhum clique registrado.</p>
                                                        ) : (
                                                            <div className="space-y-1.5">
                                                                {[...lead.buttonClicks]
                                                                    .sort((a, b) => new Date(a.clickedAt).getTime() - new Date(b.clickedAt).getTime())
                                                                    .map((click, i) => (
                                                                        <div key={i} className="flex items-center justify-between text-xs bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5">
                                                                            <span className="text-neutral-300">
                                                                                Passo {click.stepOrder + 1} · {click.buttonLabel}
                                                                                <span className="ml-2 text-neutral-500">({click.buttonKind === 'quiz' ? 'quiz' : 'link'})</span>
                                                                            </span>
                                                                            <span className="text-neutral-400">{new Date(click.clickedAt).toLocaleString('pt-BR')}</span>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
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

const REMARKETING_STATUS_LABELS: Record<string, string> = {
    selected: 'Selecionado',
    queued: 'Na fila',
    sending: 'Enviando',
    sent: 'Enviado',
    failed: 'Falhou'
};
const REMARKETING_STATUS_CLASSES: Record<string, string> = {
    selected: 'bg-neutral-700 text-neutral-300',
    queued: 'bg-blue-500/20 text-blue-400',
    sending: 'bg-blue-500/20 text-blue-400',
    sent: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400'
};

function AudiencePanel({ flowId }: { flowId: string }) {
    const [contacts, setContacts] = useState<TelegramContact[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [flowSlugFilter, setFlowSlugFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'' | 'in_progress' | 'waiting' | 'completed'>('');
    const [activeFrom, setActiveFrom] = useState<string>('');
    const [activeTo, setActiveTo] = useState<string>('');
    const [allFlows, setAllFlows] = useState<TelegramFlow[]>([]);
    const [audienceStatus, setAudienceStatus] = useState<Map<number, TelegramRemarketingStatus>>(new Map());
    const [counts, setCounts] = useState<TelegramRemarketingCounts>({ selected: 0, queued: 0, sending: 0, sent: 0, failed: 0 });
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [confirmingDispatch, setConfirmingDispatch] = useState<boolean>(false);
    const [isDispatching, setIsDispatching] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const limit = 50;

    useEffect(() => {
        getFlows().then(setAllFlows).catch((err) => console.error('Error fetching flows:', err));
    }, []);

    const loadContacts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllContacts({
                search: search || undefined,
                page,
                limit,
                flowSlug: flowSlugFilter || undefined,
                status: statusFilter || undefined,
                activeFrom: activeFrom ? new Date(activeFrom).toISOString() : undefined,
                activeTo: activeTo ? new Date(activeTo).toISOString() : undefined
            });
            setContacts(data.contacts);
            setTotal(data.total);
        } catch (err) {
            console.error('Error fetching contacts:', err);
        } finally {
            setIsLoading(false);
        }
    }, [search, page, flowSlugFilter, statusFilter, activeFrom, activeTo]);

    const loadAudience = useCallback(async () => {
        try {
            const data = await getFlowAudience(flowId);
            const statusMap = new Map<number, TelegramRemarketingStatus>(data.targets.map((t) => [t.chatId, t.status]));
            setAudienceStatus(statusMap);
            setCounts(data.counts);
            setSelected(new Set(data.targets.filter((t) => t.status === 'selected').map((t) => t.chatId)));
        } catch (err) {
            console.error('Error fetching audience:', err);
        }
    }, [flowId]);

    useEffect(() => { loadContacts(); }, [loadContacts]);
    useEffect(() => { loadAudience(); }, [loadAudience]);

    // Enquanto tiver algo em fila/enviando, atualiza sozinho pra acompanhar o progresso do disparo
    useEffect(() => {
        if (counts.queued === 0 && counts.sending === 0) return;
        const interval = setInterval(loadAudience, 4000);
        return () => clearInterval(interval);
    }, [counts.queued, counts.sending, loadAudience]);

    const toggle = (chatId: number) => {
        if (audienceStatus.has(chatId) && audienceStatus.get(chatId) !== 'selected') return; // já disparado, não mexe
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(chatId)) next.delete(chatId);
            else next.add(chatId);
            return next;
        });
    };

    const selectAllFiltered = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            contacts.forEach((c) => {
                const status = audienceStatus.get(c.chatId);
                if (!status || status === 'selected') next.add(c.chatId);
            });
            return next;
        });
    };

    const clearSelection = () => setSelected(new Set());

    const handleSaveSelection = async () => {
        setIsSaving(true);
        setMessage('');
        try {
            await setFlowAudience(flowId, [...selected]);
            await loadAudience();
            setMessage('Seleção salva.');
        } catch (err) {
            console.error('Error saving audience:', err);
            setMessage('Erro ao salvar seleção.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDispatch = async () => {
        setIsDispatching(true);
        setMessage('');
        try {
            const result = await dispatchFlow(flowId);
            setMessage(`Disparo iniciado para ${result.queued} contato(s).`);
            setConfirmingDispatch(false);
            await loadAudience();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setMessage(error.response?.data?.message || 'Erro ao disparar remarketing.');
        } finally {
            setIsDispatching(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const selectedCount = selected.size;

    // Progresso do disparo: só conta quem já foi pra fila em algum momento (ignora 'selected', que ainda não disparou)
    const dispatchTotal = counts.queued + counts.sending + counts.sent + counts.failed;
    const dispatchProcessed = counts.sent + counts.failed;
    const dispatchProgressPct = dispatchTotal > 0 ? (dispatchProcessed / dispatchTotal) * 100 : 0;

    return (
        <div className="space-y-4">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-1">Audiência de remarketing</h3>
                <p className="text-xs text-neutral-500 mb-4">
                    Marque quem vai receber este fluxo. Contatos já enviados/na fila não podem ser desmarcados — o histórico fica preservado.
                </p>

                {dispatchTotal > 0 && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                            <span>Progresso do disparo</span>
                            <span>{dispatchProcessed} de {dispatchTotal} ({Math.round(dispatchProgressPct)}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-700 rounded-full overflow-hidden flex">
                            <div className="h-full bg-green-500 transition-all" style={{ width: `${(counts.sent / dispatchTotal) * 100}%` }} />
                            <div className="h-full bg-red-500 transition-all" style={{ width: `${(counts.failed / dispatchTotal) * 100}%` }} />
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-lg bg-neutral-700 text-neutral-300">{counts.selected} selecionado(s)</span>
                    <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400">{counts.queued + counts.sending} na fila</span>
                    <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400">{counts.sent} enviado(s)</span>
                    <span className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400">{counts.failed} falharam</span>
                </div>
            </div>

            <div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-neutral-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            placeholder="Buscar por nome ou @usuário"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="bg-neutral-700 border border-neutral-600 rounded-lg pl-9 pr-3 py-1.5 text-sm w-64"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={selectAllFiltered} className="px-3 py-1.5 text-xs bg-neutral-700 hover:bg-neutral-600 rounded-lg">
                            Selecionar todos os filtrados
                        </button>
                        <button onClick={clearSelection} className="px-3 py-1.5 text-xs bg-neutral-700 hover:bg-neutral-600 rounded-lg">
                            Limpar seleção
                        </button>
                    </div>
                </div>

                <div className="p-4 border-b border-neutral-700 flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">Esteve no fluxo</label>
                        <select
                            value={flowSlugFilter}
                            onChange={(e) => { setFlowSlugFilter(e.target.value); setPage(1); }}
                            className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm"
                        >
                            <option value="">Todos</option>
                            {allFlows.map((f) => <option key={f._id} value={f.slug}>{f.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">Último status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as '' | 'in_progress' | 'waiting' | 'completed'); setPage(1); }}
                            className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm"
                        >
                            <option value="">Todos</option>
                            <option value="waiting">Esperando clique</option>
                            <option value="in_progress">Em andamento</option>
                            <option value="completed">Completou</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">Última atividade de</label>
                        <input
                            type="datetime-local"
                            value={activeFrom}
                            onChange={(e) => { setActiveFrom(e.target.value); setPage(1); }}
                            className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">até</label>
                        <input
                            type="datetime-local"
                            value={activeTo}
                            onChange={(e) => { setActiveTo(e.target.value); setPage(1); }}
                            className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm"
                        />
                    </div>
                    {(flowSlugFilter || statusFilter || activeFrom || activeTo) && (
                        <button
                            onClick={() => { setFlowSlugFilter(''); setStatusFilter(''); setActiveFrom(''); setActiveTo(''); setPage(1); }}
                            className="px-3 py-1.5 text-xs bg-neutral-700 hover:bg-neutral-600 rounded-lg"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400">Nenhum contato encontrado.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-700/50">
                                <tr>
                                    <th className="p-3 w-10"></th>
                                    <th className="text-left p-3 text-neutral-300">Contato</th>
                                    <th className="text-left p-3 text-neutral-300">Já esteve em</th>
                                    <th className="text-left p-3 text-neutral-300">Status neste fluxo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700">
                                {contacts.map((c) => {
                                    const status = audienceStatus.get(c.chatId);
                                    const isChecked = selected.has(c.chatId);
                                    const isLocked = Boolean(status) && status !== 'selected';
                                    return (
                                        <tr key={c._id} className={isLocked ? '' : 'cursor-pointer hover:bg-neutral-700/30'} onClick={() => !isLocked && toggle(c.chatId)}>
                                            <td className="p-3">
                                                <input type="checkbox" checked={isChecked} disabled={isLocked} onChange={() => toggle(c.chatId)} className="accent-amber-500" onClick={(e) => e.stopPropagation()} />
                                            </td>
                                            <td className="p-3">{c.username ? `@${c.username}` : (c.firstName || '—')}</td>
                                            <td className="p-3 text-neutral-400">{c.summary.lastFlowSlug || '—'} ({c.summary.flowsCount} fluxo(s))</td>
                                            <td className="p-3">
                                                {status ? (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${REMARKETING_STATUS_CLASSES[status]}`}>{REMARKETING_STATUS_LABELS[status]}</span>
                                                ) : (
                                                    <span className="text-neutral-600 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="p-4 border-t border-neutral-700 flex items-center justify-between text-sm">
                        <span className="text-neutral-400">{total} contato(s) · página {page} de {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 rounded-lg">Anterior</button>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 rounded-lg">Próxima</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 flex flex-wrap items-center gap-3">
                <button
                    onClick={handleSaveSelection}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 rounded-lg text-sm font-medium"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar seleção ({selectedCount})
                </button>

                {!confirmingDispatch ? (
                    <button
                        onClick={() => setConfirmingDispatch(true)}
                        disabled={counts.selected === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 rounded-lg text-sm font-medium ml-auto"
                    >
                        Disparar remarketing ({counts.selected} salvos)
                    </button>
                ) : (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-neutral-300">Confirmar disparo para {counts.selected} contato(s)?</span>
                        <button onClick={handleDispatch} disabled={isDispatching} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg text-sm font-medium">
                            {isDispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                        </button>
                        <button onClick={() => setConfirmingDispatch(false)} className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm">Cancelar</button>
                    </div>
                )}

                {message && <p className="w-full text-sm text-neutral-400">{message}</p>}
            </div>
        </div>
    );
}

function FlowEditorContent({ userId, flowId }: { userId: string; flowId: string }) {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') === 'funnel' ? 'funnel' : 'editor';

    const [tab, setTab] = useState<'editor' | 'map' | 'audience' | 'funnel'>(initialTab);
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
                        onClick={() => setTab('audience')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'audience' ? 'border-amber-500 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
                    >
                        <Users className="w-4 h-4" /> Audiência
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
                ) : tab === 'audience' ? (
                    <AudiencePanel flowId={flowId} />
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
