export type TelegramButtonKind = 'url' | 'quiz';

export interface TelegramButton {
    label: string;
    kind: TelegramButtonKind;
    url?: string;
    // Só faz sentido em botões "quiz": para onde pular ao clicar (order do passo)
    goToStep?: number;
}

export type TelegramStepType = 'text' | 'photo' | 'video';

export interface TelegramStep {
    order: number;
    type: TelegramStepType;
    text?: string;
    mediaUrl?: string;
    delaySeconds: number;
    buttons: TelegramButton[];
    // Pausa o envio aqui até alguém clicar num botão quiz ou o timeout expirar
    waitForClick?: boolean;
    timeoutSeconds?: number;
    timeoutGoToStep?: number;
}

export interface TelegramFlow {
    _id: string;
    name: string;
    slug: string;
    active: boolean;
    steps: TelegramStep[];
    createdAt: string;
    updatedAt: string;
}

export interface TelegramFlowButtonClick {
    stepOrder: number;
    buttonLabel: string;
    buttonKind: TelegramButtonKind;
    clickedAt: string;
}

export interface TelegramFlowRun {
    _id: string;
    flowId: string;
    flowSlug: string;
    chatId: number;
    username?: string;
    firstName?: string;
    startedAt: string;
    maxStepOrderReached: number;
    completedAt?: string;
    status: 'in_progress' | 'waiting' | 'completed';
    waitingStepOrder?: number;
    waitingUntil?: string;
    buttonClicks: TelegramFlowButtonClick[];
}

export interface TelegramFlowFunnelStep {
    order: number;
    type: TelegramStepType;
    label: string;
    reached: number;
}

export interface TelegramFlowFunnelButtonClick {
    stepOrder: number;
    buttonLabel: string;
    buttonKind: TelegramButtonKind;
    count: number;
}

export interface TelegramFlowCtaStat extends TelegramFlowFunnelButtonClick {
    reached: number;
    ctr: number;
}

export type TelegramFlowRange = '24h' | '7d' | '30d' | 'all';

export interface TelegramFlowTimeSeriesPoint {
    bucket: string;
    count: number;
}

export interface TelegramFlowTimeSeries {
    granularity: 'hour' | 'day';
    points: TelegramFlowTimeSeriesPoint[];
}

export interface TelegramFlowHourBucket {
    hour: number;
    count: number;
}

export interface TelegramFlowStatusBreakdown {
    in_progress: number;
    waiting: number;
    completed: number;
}

export interface TelegramFlowFunnel {
    range: TelegramFlowRange;
    totalRuns: number;
    completedRuns: number;
    completionRate: number;
    avgCompletionTimeSeconds: number | null;
    avgTimeToClickSeconds: number | null;
    uniqueUrlClickers: number;
    statusBreakdown: TelegramFlowStatusBreakdown;
    timeSeries: TelegramFlowTimeSeries;
    leadsByHour: TelegramFlowHourBucket[];
    steps: TelegramFlowFunnelStep[];
    buttonClicks: TelegramFlowFunnelButtonClick[];
    ctaStats: TelegramFlowCtaStat[];
}

export interface TelegramContactSummary {
    flowsCount: number;
    totalRuns: number;
    lastFlowSlug: string | null;
    lastStatus: 'in_progress' | 'waiting' | 'completed' | null;
    lastActivityAt: string | null;
}

export interface TelegramContact {
    _id: string;
    chatId: number;
    username?: string;
    firstName?: string;
    createdAt: string;
    updatedAt: string;
    summary: TelegramContactSummary;
}

export type TelegramRemarketingStatus = 'selected' | 'queued' | 'sending' | 'sent' | 'failed';

export interface TelegramRemarketingTarget {
    _id: string;
    chatId: number;
    username?: string;
    firstName?: string;
    status: TelegramRemarketingStatus;
    runId?: string;
    error?: string;
    queuedAt?: string;
    sentAt?: string;
}

export interface TelegramRemarketingCounts {
    selected: number;
    queued: number;
    sending: number;
    sent: number;
    failed: number;
}

export interface TelegramFlowAudience {
    targets: TelegramRemarketingTarget[];
    counts: TelegramRemarketingCounts;
}
