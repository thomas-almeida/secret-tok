import mongoose from "mongoose"
import crypto from "crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import TelegramFlow from "../models/TelegramFlow.js"
import TelegramFlowRun from "../models/TelegramFlowRun.js"
import { r2Client, R2_CONFIG } from "../config/r2Config.js"

const RANGE_DAYS = { '24h': 1, '7d': 7, '30d': 30 }

function rangeSince(range) {
    if (range === 'all' || !RANGE_DAYS[range]) return null
    const since = new Date()
    since.setDate(since.getDate() - RANGE_DAYS[range])
    return since
}

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

// Redirect rastreado pros botões "url" dos passos: loga o clique (mesmo formato
// dos cliques de quiz, só que buttonKind='url') e manda o usuário pro destino real.
// É assim que passamos a saber quem clicou pra assistir o vídeo/acessar o link.
const FALLBACK_URL = process.env.FRONTEND_URL || 'https://www.rapidinhas.top'

export const redirectClick = async (req, res) => {
    try {
        const { runId, stepOrder, buttonIndex } = req.params

        const run = await TelegramFlowRun.findById(runId)
        if (!run) return res.redirect(302, FALLBACK_URL)

        const flow = await TelegramFlow.findById(run.flowId)
        const step = flow?.steps.find((s) => s.order === Number(stepOrder))
        const button = step?.buttons?.[Number(buttonIndex)]

        if (!button || button.kind !== 'url' || !button.url) {
            return res.redirect(302, FALLBACK_URL)
        }

        run.buttonClicks.push({
            stepOrder: Number(stepOrder),
            buttonLabel: button.label,
            buttonKind: 'url'
        })
        await run.save()

        return res.redirect(302, button.url)
    } catch (error) {
        console.error('❌ Erro ao redirecionar clique de fluxo Telegram:', error.message)
        return res.redirect(302, FALLBACK_URL)
    }
}

const TIMEZONE = 'America/Sao_Paulo'

// Funil: quantos leads chegaram em cada passo, taxa de conclusão, horários de
// entrada, tempo até clicar e cliques por botão (link e quiz). Aceita
// ?range=24h|7d|30d|all pra recortar o período de todas as métricas.
export const getFlowFunnel = async (req, res) => {
    try {
        const { flowId } = req.params
        const range = ['24h', '7d', '30d', 'all'].includes(req.query.range) ? req.query.range : '7d'

        const flow = await TelegramFlow.findById(flowId)

        if (!flow) {
            return res.status(404).json({
                message: "Fluxo não encontrado"
            })
        }

        const steps = [...flow.steps].sort((a, b) => a.order - b.order)
        const flowObjectId = new mongoose.Types.ObjectId(flowId)

        const since = rangeSince(range)
        const rangeMatch = { flowId: flowObjectId, ...(since ? { startedAt: { $gte: since } } : {}) }

        const [totalRuns, completedRuns] = await Promise.all([
            TelegramFlowRun.countDocuments(rangeMatch),
            TelegramFlowRun.countDocuments({ ...rangeMatch, status: 'completed' })
        ])

        const stepsFunnel = await Promise.all(steps.map(async (step) => {
            const reached = await TelegramFlowRun.countDocuments({
                ...rangeMatch,
                maxStepOrderReached: { $gte: step.order }
            })

            return {
                order: step.order,
                type: step.type,
                label: step.text ? step.text.slice(0, 60) : `${step.type} #${step.order}`,
                reached
            }
        }))
        const reachedByStep = new Map(stepsFunnel.map((s) => [s.order, s.reached]))

        // Conta usuários únicos por botão, não o total de cliques (um mesmo lead
        // pode clicar mais de uma vez, ou até ter mais de uma execução do fluxo).
        // Cobre tanto botões "quiz" (clique via callback_query) quanto "url"
        // (clique via nosso redirect rastreado em /telegram-flows/click/...).
        const buttonClicksAgg = await TelegramFlowRun.aggregate([
            { $match: rangeMatch },
            { $unwind: '$buttonClicks' },
            {
                $group: {
                    _id: { stepOrder: '$buttonClicks.stepOrder', buttonLabel: '$buttonClicks.buttonLabel', buttonKind: '$buttonClicks.buttonKind', chatId: '$chatId' }
                }
            },
            {
                $group: {
                    _id: { stepOrder: '$_id.stepOrder', buttonLabel: '$_id.buttonLabel', buttonKind: '$_id.buttonKind' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.stepOrder': 1 } }
        ])

        // Distribuição de status atual dos leads (em andamento / esperando clique / completou)
        const statusAgg = await TelegramFlowRun.aggregate([
            { $match: rangeMatch },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
        const statusBreakdown = { in_progress: 0, waiting: 0, completed: 0 }
        statusAgg.forEach((s) => { statusBreakdown[s._id] = s.count })

        // Tempo médio (segundos) do início até a conclusão do fluxo, só entre quem completou
        const [avgCompletionAgg] = await TelegramFlowRun.aggregate([
            { $match: { ...rangeMatch, status: 'completed', completedAt: { $exists: true } } },
            { $project: { seconds: { $divide: [{ $subtract: ['$completedAt', '$startedAt'] }, 1000] } } },
            { $group: { _id: null, avgSeconds: { $avg: '$seconds' } } }
        ])
        const avgCompletionTimeSeconds = avgCompletionAgg?.avgSeconds ?? null

        // Tempo médio (segundos) da entrada até o PRIMEIRO clique em qualquer botão
        const [avgClickAgg] = await TelegramFlowRun.aggregate([
            { $match: { ...rangeMatch, 'buttonClicks.0': { $exists: true } } },
            { $project: { seconds: { $divide: [{ $subtract: [{ $min: '$buttonClicks.clickedAt' }, '$startedAt'] }, 1000] } } },
            { $group: { _id: null, avgSeconds: { $avg: '$seconds' } } }
        ])
        const avgTimeToClickSeconds = avgClickAgg?.avgSeconds ?? null

        // Quantos leads únicos clicaram pra assistir/acessar (qualquer botão "url")
        const [uniqueUrlClickersAgg] = await TelegramFlowRun.aggregate([
            { $match: { ...rangeMatch, 'buttonClicks.buttonKind': 'url' } },
            { $group: { _id: '$chatId' } },
            { $count: 'count' }
        ])
        const uniqueUrlClickers = uniqueUrlClickersAgg?.count ?? 0

        // Série temporal de novos leads. Granularidade se adapta ao período:
        // 24h -> por hora (últimas 24h), 7d/30d/all -> por dia.
        const isHourly = range === '24h'
        const seriesSince = since || (await TelegramFlowRun.findOne({ flowId: flowObjectId }).sort({ startedAt: 1 }).select('startedAt'))?.startedAt || new Date()
        const seriesStart = new Date(seriesSince)
        if (!isHourly) seriesStart.setHours(0, 0, 0, 0)
        const spanMs = Date.now() - seriesStart.getTime()
        const bucketCount = isHourly
            ? 24
            : Math.min(90, Math.max(1, Math.ceil(spanMs / (1000 * 60 * 60 * 24)) + 1))

        const timeSeriesAgg = await TelegramFlowRun.aggregate([
            { $match: { flowId: flowObjectId, startedAt: { $gte: seriesStart } } },
            {
                $group: {
                    _id: isHourly
                        ? { $dateToString: { format: '%Y-%m-%dT%H:00', date: '$startedAt', timezone: TIMEZONE } }
                        : { $dateToString: { format: '%Y-%m-%d', date: '$startedAt', timezone: TIMEZONE } },
                    count: { $sum: 1 }
                }
            }
        ])
        const timeSeriesMap = new Map(timeSeriesAgg.map((d) => [d._id, d.count]))
        const timeSeries = []
        for (let i = 0; i < bucketCount; i++) {
            const bucket = new Date(seriesStart)
            if (isHourly) bucket.setHours(bucket.getHours() + i)
            else bucket.setDate(bucket.getDate() + i)
            if (bucket.getTime() > Date.now()) break

            const key = isHourly
                ? `${bucket.toLocaleDateString('sv-SE', { timeZone: TIMEZONE })}T${String(bucket.getHours()).padStart(2, '0')}:00`
                : bucket.toLocaleDateString('sv-SE', { timeZone: TIMEZONE })
            timeSeries.push({ bucket: key, count: timeSeriesMap.get(key) || 0 })
        }

        // Horário de pico: soma de leads por hora do dia (0-23), agregando todos
        // os dias do período selecionado — mostra em que horas o funil mais entra gente.
        const leadsByHourAgg = await TelegramFlowRun.aggregate([
            { $match: rangeMatch },
            { $group: { _id: { $dateToString: { format: '%H', date: '$startedAt', timezone: TIMEZONE } }, count: { $sum: 1 } } }
        ])
        const leadsByHourMap = new Map(leadsByHourAgg.map((d) => [Number(d._id), d.count]))
        const leadsByHour = Array.from({ length: 24 }, (_, hour) => ({ hour, count: leadsByHourMap.get(hour) || 0 }))

        const buttonClicks = buttonClicksAgg.map((click) => ({
            stepOrder: click._id.stepOrder,
            buttonLabel: click._id.buttonLabel,
            buttonKind: click._id.buttonKind,
            count: click.count
        }))

        // CTR por botão: cliques únicos / leads que alcançaram o passo do botão
        const ctaStats = buttonClicks.map((click) => {
            const reached = reachedByStep.get(click.stepOrder) || 0
            return {
                ...click,
                reached,
                ctr: reached > 0 ? click.count / reached : 0
            }
        })

        return res.status(200).json({
            range,
            totalRuns,
            completedRuns,
            completionRate: totalRuns > 0 ? completedRuns / totalRuns : 0,
            avgCompletionTimeSeconds,
            avgTimeToClickSeconds,
            uniqueUrlClickers,
            statusBreakdown,
            timeSeries: { granularity: isHourly ? 'hour' : 'day', points: timeSeries },
            leadsByHour,
            steps: stepsFunnel,
            buttonClicks,
            ctaStats
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

// Troca {{nome}}/{{username}} pelos dados do lead (mesma substituição que o bot faz
// antes de enviar). Mantém os marcadores **negrito** intactos pro frontend decidir
// como renderizar, em vez de mandar HTML pronto.
function fillPlaceholders(text, run) {
    if (!text) return text
    return text
        .replace(/\{\{\s*nome\s*\}\}/gi, run.firstName || '')
        .replace(/\{\{\s*username\s*\}\}/gi, run.username || '')
}

// Reconstrói a jornada real do lead dentro do fluxo: quais mensagens foram
// enviadas, em que ordem, e quando cada clique aconteceu — respeitando desvios
// condicionais (goToStep/timeoutGoToStep), não apenas "passo 0 até o alcançado".
// Os horários de mensagens antes do primeiro clique são estimados a partir do
// delaySeconds acumulado desde o início; a partir de um clique ou timeout, o
// relógio é realinhado pelo horário real do clique (ou pelo waitingUntil, no
// caso de resolução por timeout).
export const getLeadTimeline = async (req, res) => {
    try {
        const { flowId, runId } = req.params

        const [flow, run] = await Promise.all([
            TelegramFlow.findById(flowId),
            TelegramFlowRun.findOne({ _id: runId, flowId })
        ])

        if (!flow || !run) {
            return res.status(404).json({ message: "Fluxo ou lead não encontrado" })
        }

        const stepsByOrder = new Map(flow.steps.map((s) => [s.order, s]))
        const sortedOrders = [...stepsByOrder.keys()].sort((a, b) => a - b)
        const startedAtMs = new Date(run.startedAt).getTime()

        const timeline = []
        let cursor = sortedOrders[0]
        let cumulativeMs = 0
        const visitedOrders = new Set()

        while (cursor !== undefined && cursor !== null && !visitedOrders.has(cursor)) {
            const step = stepsByOrder.get(cursor)
            if (!step) break
            visitedOrders.add(cursor)

            cumulativeMs += (step.delaySeconds || 0) * 1000
            const estimatedAt = new Date(startedAtMs + cumulativeMs)

            timeline.push({
                type: 'message',
                stepOrder: step.order,
                stepType: step.type,
                text: fillPlaceholders(step.text, run),
                mediaUrl: step.mediaUrl || null,
                buttons: step.buttons || [],
                estimatedAt
            })

            const clicksOnStep = run.buttonClicks.filter((c) => c.stepOrder === step.order)
            clicksOnStep.forEach((c) => {
                timeline.push({
                    type: 'click',
                    stepOrder: step.order,
                    buttonLabel: c.buttonLabel,
                    buttonKind: c.buttonKind,
                    at: c.clickedAt
                })
            })

            const hasQuizButton = step.buttons?.some((b) => b.kind === 'quiz')
            if (step.waitForClick && hasQuizButton) {
                const quizClick = clicksOnStep.find((c) => c.buttonKind === 'quiz')
                if (quizClick) {
                    const button = step.buttons.find((b) => b.kind === 'quiz' && b.label === quizClick.buttonLabel)
                    cursor = button?.goToStep ?? (step.order + 1)
                    cumulativeMs = new Date(quizClick.clickedAt).getTime() - startedAtMs
                } else if (run.status === 'waiting' && run.waitingStepOrder === step.order) {
                    cursor = null // ainda pausado exatamente aqui
                } else {
                    // ninguém clicou: resolvido pelo sweep de timeout
                    cursor = step.timeoutGoToStep ?? (step.order + 1)
                    if (run.waitingUntil) cumulativeMs = new Date(run.waitingUntil).getTime() - startedAtMs
                }
            } else {
                cursor = step.order + 1
            }
        }

        return res.status(200).json({
            run: {
                _id: run._id,
                chatId: run.chatId,
                username: run.username,
                firstName: run.firstName,
                startedAt: run.startedAt,
                completedAt: run.completedAt,
                status: run.status,
                waitingUntil: run.waitingUntil
            },
            timeline
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao montar a jornada do lead",
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

        if (!process.env.R2_USER_API_S3_URL || !process.env.R2_USER_API_ACCESS_KEY || !process.env.R2_USER_API_SECRET_ACCESS_KEY) {
            return res.status(500).json({
                message: "R2 não configurado no ambiente (faltam R2_USER_API_S3_URL / R2_USER_API_ACCESS_KEY / R2_USER_API_SECRET_ACCESS_KEY)"
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
