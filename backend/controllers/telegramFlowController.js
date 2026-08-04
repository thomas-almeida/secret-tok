import mongoose from "mongoose"
import crypto from "crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import TelegramFlow from "../models/TelegramFlow.js"
import TelegramFlowRun from "../models/TelegramFlowRun.js"
import { r2Client, R2_CONFIG } from "../config/r2Config.js"

export const createFlow = async (req, res) => {
    try {
        const { name, slug, active, steps } = req.body

        if (!name || !slug) {
            return res.status(400).json({
                message: "Nome e slug são obrigatórios"
            })
        }

        const newFlow = new TelegramFlow({
            name,
            slug,
            active: active !== undefined ? active : true,
            steps: steps || []
        })

        const savedFlow = await newFlow.save()

        return res.status(201).json({
            message: "Fluxo criado com sucesso",
            flow: savedFlow
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Já existe um fluxo com esse slug"
            })
        }
        return res.status(500).json({
            message: "Erro ao criar fluxo",
            error: error.message
        })
    }
}

export const getAllFlows = async (req, res) => {
    try {
        const flows = await TelegramFlow.find().sort({ createdAt: -1 })

        return res.status(200).json({
            message: "Fluxos listados com sucesso",
            count: flows.length,
            flows
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar fluxos",
            error: error.message
        })
    }
}

export const getFlowById = async (req, res) => {
    try {
        const { flowId } = req.params

        const flow = await TelegramFlow.findById(flowId)

        if (!flow) {
            return res.status(404).json({
                message: "Fluxo não encontrado"
            })
        }

        return res.status(200).json({
            message: "Fluxo encontrado",
            flow
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar fluxo",
            error: error.message
        })
    }
}

export const updateFlow = async (req, res) => {
    try {
        const { flowId } = req.params
        const { name, slug, active, steps } = req.body

        const flow = await TelegramFlow.findById(flowId)

        if (!flow) {
            return res.status(404).json({
                message: "Fluxo não encontrado"
            })
        }

        if (name !== undefined) flow.name = name
        if (slug !== undefined) flow.slug = slug
        if (active !== undefined) flow.active = active
        if (steps !== undefined) flow.steps = steps

        const updatedFlow = await flow.save()

        return res.status(200).json({
            message: "Fluxo atualizado com sucesso",
            flow: updatedFlow
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Já existe um fluxo com esse slug"
            })
        }
        return res.status(500).json({
            message: "Erro ao atualizar fluxo",
            error: error.message
        })
    }
}

export const deleteFlow = async (req, res) => {
    try {
        const { flowId } = req.params

        const deletedFlow = await TelegramFlow.findByIdAndDelete(flowId)

        if (!deletedFlow) {
            return res.status(404).json({
                message: "Fluxo não encontrado"
            })
        }

        return res.status(200).json({
            message: "Fluxo deletado com sucesso"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao deletar fluxo",
            error: error.message
        })
    }
}

// Funil: quantos leads chegaram em cada passo, taxa de conclusão e cliques por botão
export const getFlowFunnel = async (req, res) => {
    try {
        const { flowId } = req.params

        const flow = await TelegramFlow.findById(flowId)

        if (!flow) {
            return res.status(404).json({
                message: "Fluxo não encontrado"
            })
        }

        const steps = [...flow.steps].sort((a, b) => a.order - b.order)

        const [totalRuns, completedRuns] = await Promise.all([
            TelegramFlowRun.countDocuments({ flowId }),
            TelegramFlowRun.countDocuments({ flowId, status: 'completed' })
        ])

        const stepsFunnel = await Promise.all(steps.map(async (step) => {
            const reached = await TelegramFlowRun.countDocuments({
                flowId,
                maxStepOrderReached: { $gte: step.order }
            })

            return {
                order: step.order,
                type: step.type,
                label: step.text ? step.text.slice(0, 60) : `${step.type} #${step.order}`,
                reached
            }
        }))

        const buttonClicksAgg = await TelegramFlowRun.aggregate([
            { $match: { flowId: new mongoose.Types.ObjectId(flowId) } },
            { $unwind: '$buttonClicks' },
            {
                $group: {
                    _id: { stepOrder: '$buttonClicks.stepOrder', buttonLabel: '$buttonClicks.buttonLabel' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.stepOrder': 1 } }
        ])

        return res.status(200).json({
            totalRuns,
            completedRuns,
            completionRate: totalRuns > 0 ? completedRuns / totalRuns : 0,
            steps: stepsFunnel,
            buttonClicks: buttonClicksAgg.map((click) => ({
                stepOrder: click._id.stepOrder,
                buttonLabel: click._id.buttonLabel,
                count: click.count
            }))
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao gerar funil do fluxo",
            error: error.message
        })
    }
}

// Lista de leads (execuções do fluxo) com filtros por status/passo mínimo alcançado
export const getFlowLeads = async (req, res) => {
    try {
        const { flowId } = req.params
        const { status, minStep, page = 1, limit = 50 } = req.query

        const filter = { flowId }
        if (status) filter.status = status
        if (minStep) filter.maxStepOrderReached = { $gte: Number(minStep) }

        const skip = (Number(page) - 1) * Number(limit)

        const [leads, total] = await Promise.all([
            TelegramFlowRun.find(filter).sort({ startedAt: -1 }).skip(skip).limit(Number(limit)),
            TelegramFlowRun.countDocuments(filter)
        ])

        return res.status(200).json({
            leads,
            total,
            page: Number(page),
            limit: Number(limit)
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar leads do fluxo",
            error: error.message
        })
    }
}

// Upload de foto/vídeo para os passos do fluxo, armazenado no bucket R2 já usado pelos vídeos do app
export const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Nenhum arquivo enviado"
            })
        }

        const extension = req.file.originalname.split('.').pop()?.toLowerCase() || 'bin'
        const key = `telegram-flows/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`

        await r2Client.send(new PutObjectCommand({
            Bucket: R2_CONFIG.bucket,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }))

        return res.status(201).json({
            message: "Upload realizado com sucesso",
            url: `${R2_CONFIG.publicBaseUrl}/${key}`
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao enviar arquivo",
            error: error.message
        })
    }
}
