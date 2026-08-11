import TelegramFlow from "../models/TelegramFlow.js"
import TelegramContact from "../models/TelegramContact.js"
import TelegramRemarketingTarget from "../models/TelegramRemarketingTarget.js"
import telegramFlowBotService from "../services/telegramFlowBotService.js"

// Lista geral de todo contato que já deu /start em algum fluxo (base pra montar
// audiências de remarketing), enriquecida com em quantos fluxos ele já passou.
// flowSlug/excludeFlowSlug checam TODO o histórico de execuções do contato (não
// só a mais recente) — "esteve no fluxo X" e "não esteve em Y" precisam olhar
// pra trás inteiro, senão alguém que passou por X e depois por Y escaparia dos
// dois filtros. status/data-hora continuam batendo na execução mais recente.
// Tudo entra na agregação antes da paginação (não dá pra filtrar em JS depois).
export const getAllContacts = async (req, res) => {
    try {
        const { search, page = 1, limit = 50, flowSlug, excludeFlowSlug, status, activeFrom, activeTo } = req.query
        const skip = (Number(page) - 1) * Number(limit)
        const excludeFlowSlugs = Array.isArray(excludeFlowSlug)
            ? excludeFlowSlug
            : (excludeFlowSlug ? String(excludeFlowSlug).split(',').filter(Boolean) : [])

        const contactMatch = {}
        if (search) {
            contactMatch.$or = [
                { username: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } }
            ]
        }

        const pipeline = [
            { $match: contactMatch },
            { $lookup: { from: 'telegramflowruns', localField: 'chatId', foreignField: 'chatId', as: 'runs' } },
            {
                $addFields: {
                    flowSlugs: { $setUnion: ['$runs.flowSlug', []] },
                    flowsCount: { $size: { $setUnion: ['$runs.flowId', []] } },
                    totalRuns: { $size: '$runs' },
                    lastRun: {
                        $arrayElemAt: [
                            { $sortArray: { input: '$runs', sortBy: { startedAt: -1 } } },
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    lastFlowSlug: '$lastRun.flowSlug',
                    lastStatus: '$lastRun.status',
                    lastActivityAt: '$lastRun.startedAt'
                }
            }
        ]

        const andConditions = []
        if (flowSlug) andConditions.push({ flowSlugs: flowSlug })
        if (excludeFlowSlugs.length > 0) andConditions.push({ flowSlugs: { $nin: excludeFlowSlugs } })
        if (status) andConditions.push({ lastStatus: status })
        if (activeFrom || activeTo) {
            const activityRange = {}
            if (activeFrom) activityRange.$gte = new Date(activeFrom)
            if (activeTo) activityRange.$lte = new Date(activeTo)
            andConditions.push({ lastActivityAt: activityRange })
        }
        if (andConditions.length > 0) {
            pipeline.push({ $match: { $and: andConditions } })
        }

        pipeline.push({ $sort: { lastActivityAt: -1, updatedAt: -1 } })
        pipeline.push({
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: Number(limit) },
                    { $project: { chatId: 1, username: 1, firstName: 1, createdAt: 1, updatedAt: 1, flowsCount: 1, totalRuns: 1, lastFlowSlug: 1, lastStatus: 1, lastActivityAt: 1 } }
                ],
                totalCount: [{ $count: 'count' }]
            }
        })

        const [result] = await TelegramContact.aggregate(pipeline)
        const contacts = (result?.data || []).map((c) => ({
            _id: c._id,
            chatId: c.chatId,
            username: c.username,
            firstName: c.firstName,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            summary: {
                flowsCount: c.flowsCount,
                totalRuns: c.totalRuns,
                lastFlowSlug: c.lastFlowSlug || null,
                lastStatus: c.lastStatus || null,
                lastActivityAt: c.lastActivityAt || null
            }
        }))
        const total = result?.totalCount?.[0]?.count || 0

        return res.status(200).json({ contacts, total, page: Number(page), limit: Number(limit) })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar contatos",
            error: error.message
        })
    }
}

// Audiência atual de remarketing de um fluxo (quem foi marcado, e o status de cada um)
export const getFlowAudience = async (req, res) => {
    try {
        const { flowId } = req.params

        const targets = await TelegramRemarketingTarget.find({ flowId }).sort({ updatedAt: -1 })

        const chatIds = targets.map((t) => t.chatId)
        const contacts = await TelegramContact.find({ chatId: { $in: chatIds } })
        const contactMap = new Map(contacts.map((c) => [c.chatId, c]))

        const counts = { selected: 0, queued: 0, sending: 0, sent: 0, failed: 0 }
        const items = targets.map((t) => {
            counts[t.status] = (counts[t.status] || 0) + 1
            const contact = contactMap.get(t.chatId)
            return {
                _id: t._id,
                chatId: t.chatId,
                username: contact?.username,
                firstName: contact?.firstName,
                status: t.status,
                runId: t.runId,
                error: t.error,
                queuedAt: t.queuedAt,
                sentAt: t.sentAt
            }
        })

        return res.status(200).json({ targets: items, counts })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar audiência do fluxo",
            error: error.message
        })
    }
}

// Marca quais contatos vão receber o remarketing desse fluxo. Só mexe em quem
// ainda está 'selected' — não toca em quem já foi pra fila/enviado/falhou, pra
// preservar o histórico de disparos já feitos.
export const setFlowAudience = async (req, res) => {
    try {
        const { flowId } = req.params
        const { chatIds } = req.body

        if (!Array.isArray(chatIds)) {
            return res.status(400).json({ message: "chatIds deve ser uma lista" })
        }

        const flow = await TelegramFlow.findById(flowId)
        if (!flow) {
            return res.status(404).json({ message: "Fluxo não encontrado" })
        }

        const uniqueChatIds = [...new Set(chatIds.map(Number))]

        const existing = await TelegramRemarketingTarget.find({ flowId }).select('chatId status')
        const existingMap = new Map(existing.map((e) => [e.chatId, e.status]))

        const toAdd = uniqueChatIds.filter((id) => !existingMap.has(id))
        const toRemove = existing
            .filter((e) => e.status === 'selected' && !uniqueChatIds.includes(e.chatId))
            .map((e) => e.chatId)

        await Promise.all([
            toAdd.length > 0
                ? TelegramRemarketingTarget.insertMany(toAdd.map((chatId) => ({ flowId, chatId, status: 'selected' })))
                : null,
            toRemove.length > 0
                ? TelegramRemarketingTarget.deleteMany({ flowId, chatId: { $in: toRemove } })
                : null
        ])

        return res.status(200).json({ message: "Audiência atualizada", added: toAdd.length, removed: toRemove.length })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao atualizar audiência do fluxo",
            error: error.message
        })
    }
}

// "Aperta o botão de disparar": move todo mundo 'selected' desse fluxo pra
// 'queued'. O worker em telegramFlowBotService pega daí em diante, aos poucos.
export const dispatchFlow = async (req, res) => {
    try {
        const { flowId } = req.params

        const flow = await TelegramFlow.findById(flowId)
        if (!flow) {
            return res.status(404).json({ message: "Fluxo não encontrado" })
        }

        if (!telegramFlowBotService.enabled) {
            return res.status(503).json({ message: "Bot do Telegram não está configurado neste ambiente" })
        }

        const result = await TelegramRemarketingTarget.updateMany(
            { flowId, status: 'selected' },
            { status: 'queued', queuedAt: new Date() }
        )

        return res.status(200).json({ message: "Disparo iniciado", queued: result.modifiedCount })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao disparar remarketing",
            error: error.message
        })
    }
}
