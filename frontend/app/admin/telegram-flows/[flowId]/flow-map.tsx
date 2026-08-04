'use client';

import { useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    Handle,
    Position,
    type Node,
    type Edge,
    type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ImageIcon, Video, Type, Timer, MessageSquareText } from 'lucide-react';
import { TelegramButtonKind, TelegramStepType } from '../../../schemas/telegram-flow-schema';

interface FlowMapButton {
    label: string;
    kind: TelegramButtonKind;
    goToStep?: number;
}

interface FlowMapStep {
    type: TelegramStepType;
    text?: string;
    buttons: FlowMapButton[];
    waitForClick?: boolean;
    timeoutSeconds?: number;
    timeoutGoToStep?: number;
}

interface StepNodeData extends Record<string, unknown> {
    index: number;
    step: FlowMapStep;
}

type StepNode = Node<StepNodeData, 'step'>;

const NODE_WIDTH = 240;

function StepNodeComponent({ data }: NodeProps<StepNode>) {
    const { index, step } = data;
    const TypeIcon = step.type === 'photo' ? ImageIcon : step.type === 'video' ? Video : Type;
    const preview = (step.text || '').slice(0, 70) || '(sem texto)';

    return (
        <div className="w-56 cursor-pointer rounded-lg border border-neutral-700 bg-neutral-800 p-3 shadow-lg hover:border-amber-500 transition-colors">
            <Handle type="target" position={Position.Left} className="!bg-neutral-500 !border-neutral-800" />

            <div className="flex items-center gap-2 mb-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-600 text-[11px] font-bold text-white shrink-0">
                    {index + 1}
                </span>
                <TypeIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                {step.waitForClick && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-400 ml-auto shrink-0">
                        <Timer className="w-3 h-3" />
                        {step.timeoutSeconds ? `${step.timeoutSeconds}s` : 'espera'}
                    </span>
                )}
            </div>

            <p className="text-xs text-neutral-300 line-clamp-2 break-words">{preview}</p>

            {step.buttons.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-neutral-500">
                    <MessageSquareText className="w-3 h-3" />
                    {step.buttons.length} botão(ões)
                </div>
            )}

            <Handle type="source" position={Position.Right} className="!bg-neutral-500 !border-neutral-800" />
        </div>
    );
}

const nodeTypes = { step: StepNodeComponent };

export default function FlowMap({ steps, onSelectStep }: { steps: FlowMapStep[]; onSelectStep: (index: number) => void }) {
    const nodes = useMemo<StepNode[]>(() => steps.map((step, index) => ({
        id: String(index),
        type: 'step',
        position: { x: index * NODE_WIDTH, y: 0 },
        data: { index, step },
    })), [steps]);

    const edges = useMemo<Edge[]>(() => {
        const list: Edge[] = [];

        steps.forEach((step, index) => {
            if (index < steps.length - 1) {
                list.push({
                    id: `seq-${index}`,
                    source: String(index),
                    target: String(index + 1),
                    style: { stroke: '#525252', strokeWidth: 1.5 },
                });
            }

            step.buttons.forEach((button, buttonIndex) => {
                if (button.kind === 'quiz' && button.goToStep !== undefined && button.goToStep !== null && button.goToStep < steps.length) {
                    list.push({
                        id: `btn-${index}-${buttonIndex}`,
                        source: String(index),
                        target: String(button.goToStep),
                        label: button.label || 'clique',
                        style: { stroke: '#f59e0b', strokeWidth: 1.5 },
                        labelStyle: { fill: '#f59e0b', fontSize: 11 },
                        labelBgStyle: { fill: '#171717' },
                        animated: true,
                    });
                }
            });

            if (
                step.waitForClick &&
                step.timeoutGoToStep !== undefined &&
                step.timeoutGoToStep !== null &&
                step.timeoutGoToStep !== index + 1 &&
                step.timeoutGoToStep < steps.length
            ) {
                list.push({
                    id: `timeout-${index}`,
                    source: String(index),
                    target: String(step.timeoutGoToStep),
                    label: `timeout${step.timeoutSeconds ? ` ${step.timeoutSeconds}s` : ''}`,
                    style: { stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '4 3' },
                    labelStyle: { fill: '#3b82f6', fontSize: 11 },
                    labelBgStyle: { fill: '#171717' },
                });
            }
        });

        return list;
    }, [steps]);

    if (steps.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-neutral-400 text-sm border border-dashed border-neutral-700 rounded-lg">
                Adicione passos para ver o mapa do fluxo.
            </div>
        );
    }

    return (
        <div className="h-[70vh] bg-neutral-950 border border-neutral-700 rounded-lg overflow-hidden">
            {/* O tema escuro global do app deixava os ícones dos controles (brancos) invisíveis
                sobre o fundo padrão (também branco) do react-flow — força um estilo escuro aqui. */}
            <style jsx global>{`
                .react-flow__controls-button {
                    background: #262626;
                    border-bottom-color: #404040;
                }
                .react-flow__controls-button:hover {
                    background: #404040;
                }
                .react-flow__controls-button svg {
                    fill: #e5e5e5;
                }
            `}</style>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => onSelectStep(Number(node.id))}
                fitView
                nodesConnectable={false}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#404040" gap={20} />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}
