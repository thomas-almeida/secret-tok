export type TelegramButtonKind = 'url' | 'quiz';

export interface TelegramButton {
    label: string;
    kind: TelegramButtonKind;
    url?: string;
}

export type TelegramStepType = 'text' | 'photo' | 'video';

export interface TelegramStep {
    order: number;
    type: TelegramStepType;
    text?: string;
    mediaUrl?: string;
    delaySeconds: number;
    buttons: TelegramButton[];
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
    status: 'in_progress' | 'completed';
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
    count: number;
}

export interface TelegramFlowFunnel {
    totalRuns: number;
    completedRuns: number;
    completionRate: number;
    steps: TelegramFlowFunnelStep[];
    buttonClicks: TelegramFlowFunnelButtonClick[];
}
