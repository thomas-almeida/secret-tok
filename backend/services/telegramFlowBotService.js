import TelegramBot from 'node-telegram-bot-api'
import TelegramFlow from '../models/TelegramFlow.js'
import TelegramContact from '../models/TelegramContact.js'
import TelegramFlowRun from '../models/TelegramFlowRun.js'
import TelegramRemarketingTarget from '../models/TelegramRemarketingTarget.js'
import { TELEGRAM_FLOW_CONFIG } from '../config/telegramFlowConfig.js'

// Intervalo entre envios de remarketing (bem abaixo do limite de ~30 msg/s do
// Telegram) pra não estourar rate limit nem parecer spam em massa pro provedor.
const DISPATCH_THROTTLE_MS = 300
const DISPATCH_BATCH_SIZE = 20

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

// Substitui {{nome}}/{{username}} pelos dados do contato e converte **negrito**
// (Markdown comum) pro formato HTML que o Telegram entende. Escapa o template e
// os valores separadamente pra nenhum dos dois quebrar o parse_mode HTML.
function renderStepText(text, contact) {
    if (!text) return text

    const withPlaceholders = escapeHtml(text)
        .replace(/\{\{\s*nome\s*\}\}/gi, escapeHtml(contact?.firstName))
        .replace(/\{\{\s*username\s*\}\}/gi, escapeHtml(contact?.username))

    return withPlaceholders.replace(/\*\*(.+?)\*\*/gs, '<b>$1</b>')
}

class TelegramFlowBotService {
    constructor() {
        this.bot = null
        this.enabled = Boolean(TELEGRAM_FLOW_CONFIG.botToken)
        this.isDispatching = false // trava em memória: evita duas rodadas do worker pegarem o mesmo lote

        if (this.enabled) {
            this.bot = new TelegramBot(TELEGRAM_FLOW_CONFIG.botToken, { polling: false, webHook: false })
            this.registerHandlers()
        }
    }

    registerHandlers() {
        this.bot.onText(/^\/start(?:\s+(.+))?/, async (msg, match) => {
            const slug = match?.[1]?.trim()
            if (!slug) return

            try {
                await this.startFlowForChat(msg.chat, slug)
            } catch (error) {
                console.error('❌ Erro ao iniciar fluxo de Telegram:', error.message)
            }
        })

        this.bot.on('callback_query', async (query) => {
            try {
                await this.handleCallbackQuery(query)
            } catch (error) {
                console.error('❌ Erro ao processar callback_query do Telegram:', error.message)
            } finally {
                this.bot.answerCallbackQuery(query.id).catch(() => { })
            }
        })
    }

    async registerWebhook() {
        if (!this.enabled) {
            console.log('ℹ️ Telegram Flow Bot desabilitado (TELEGRAM_FLOW_BOT_TOKEN não configurado)')
            return
        }

        if (!TELEGRAM_FLOW_CONFIG.publicBaseUrl || !TELEGRAM_FLOW_CONFIG.webhookSecret) {
            console.warn('⚠️ PUBLIC_BASEURL ou TELEGRAM_FLOW_WEBHOOK_SECRET ausente, webhook do Flow Bot não foi registrado')
            return
        }

        const webhookUrl = `${TELEGRAM_FLOW_CONFIG.publicBaseUrl}/api/telegram-bot/webhook/${TELEGRAM_FLOW_CONFIG.webhookSecret}`

        try {
            await this.bot.setWebHook(webhookUrl)
            console.log(`🤖 Telegram Flow Bot webhook registrado: ${webhookUrl}`)
        } catch (error) {
            console.error('❌ Falha ao registrar webhook do Telegram Flow Bot:', error.message)
        }
    }

    handleUpdate(update) {
        if (!this.enabled) return
        this.bot.processUpdate(update)
    }

    async startFlowForChat(chat, slug) {
        const flow = await TelegramFlow.findOne({ slug: slug.toLowerCase(), active: true })

        if (!flow) {
            console.log(`ℹ️ Nenhum fluxo ativo encontrado para o slug "${slug}"`)
            return
        }

        await TelegramContact.findOneAndUpdate(
            { chatId: chat.id },
            { chatId: chat.id, username: chat.username, firstName: chat.first_name },
            { upsert: true }
        )

        const run = await TelegramFlowRun.create({
            flowId: flow._id,
            flowSlug: flow.slug,
            chatId: chat.id,
            username: chat.username,
            firstName: chat.first_name
        })

        await this.runFlow(chat.id, flow, run)
    }

    // Dispara um fluxo pra um contato que JÁ deu /start antes (remarketing) —
    // diferente de startFlowForChat, não depende de uma mensagem recebida agora.
    async sendFlowToContact(flow, contact) {
        const run = await TelegramFlowRun.create({
            flowId: flow._id,
            flowSlug: flow.slug,
            chatId: contact.chatId,
            username: contact.username,
            firstName: contact.firstName
        })

        await this.runFlow(contact.chatId, flow, run)
        return run
    }

    // Processa a fila de remarketing ('queued' -> 'sent'/'failed'), reivindicando
    // um alvo por vez com findOneAndUpdate atômico (evita duas execuções — do
    // mesmo processo ou de dois processos concorrentes — mandarem em duplicidade
    // pro mesmo contato) e um intervalo entre envios pra não estourar rate limit
    // do Telegram nem soar como spam em massa.
    async processDispatchQueue() {
        if (!this.enabled || this.isDispatching) return
        this.isDispatching = true

        try {
            for (let i = 0; i < DISPATCH_BATCH_SIZE; i++) {
                const target = await TelegramRemarketingTarget.findOneAndUpdate(
                    { status: 'queued' },
                    { status: 'sending' },
                    { new: true }
                )
                if (!target) break // fila vazia

                try {
                    const [flow, contact] = await Promise.all([
                        TelegramFlow.findById(target.flowId),
                        TelegramContact.findOne({ chatId: target.chatId })
                    ])

                    if (!flow || !contact) {
                        target.status = 'failed'
                        target.error = !flow ? 'Fluxo não encontrado' : 'Contato não encontrado'
                        await target.save()
                        continue
                    }

                    const run = await this.sendFlowToContact(flow, contact)
                    target.status = 'sent'
                    target.runId = run._id
                    target.sentAt = new Date()
                    await target.save()
                } catch (error) {
                    target.status = 'failed'
                    target.error = error.message
                    await target.save()
                }

                await delay(DISPATCH_THROTTLE_MS)
            }
        } catch (error) {
            console.error('❌ Erro ao processar fila de remarketing:', error.message)
        } finally {
            this.isDispatching = false
        }
    }

    startDispatchWorker() {
        if (!this.enabled) return
        setInterval(() => this.processDispatchQueue(), 5 * 1000)
    }

    // Botões "url" abrem o link direto no cliente do Telegram e nunca disparam
    // callback_query, então roteamos por um redirect nosso (que loga o clique e
    // devolve 302 pro destino real) pra conseguir medir quem clicou pra assistir.
    // Botões "quiz" levam o runId no callback_data (em vez de resolver "o run mais
    // recente desse chatId") porque com remarketing um mesmo contato pode ter
    // vários runs concorrentes em fluxos diferentes ao mesmo tempo.
    buildReplyMarkup(step, runId) {
        if (!step.buttons || step.buttons.length === 0) return {}

        const inline_keyboard = [step.buttons.map((button, index) => {
            if (button.kind === 'url') {
                const trackedUrl = `${TELEGRAM_FLOW_CONFIG.publicBaseUrl}/api/telegram-flows/click/${runId}/${step.order}/${index}`
                return { text: button.label, url: trackedUrl }
            }
            return { text: button.label, callback_data: `${runId}:${step.order}:${index}` }
        })]

        return { reply_markup: { inline_keyboard } }
    }

    // fromOrder: a partir de qual passo continuar (usado ao retomar de uma pausa)
    async runFlow(chatId, flow, run, fromOrder = -Infinity) {
        const contact = await TelegramContact.findOne({ chatId })
        const steps = [...flow.steps].sort((a, b) => a.order - b.order).filter((s) => s.order >= fromOrder)

        for (const step of steps) {
            if (step.delaySeconds > 0) {
                await delay(step.delaySeconds * 1000)
            }

            const replyMarkup = this.buildReplyMarkup(step, run._id)
            const text = renderStepText(step.text, contact)

            try {
                if (step.type === 'text') {
                    await this.bot.sendMessage(chatId, text || '', { parse_mode: 'HTML', ...replyMarkup })
                } else if (step.type === 'photo') {
                    await this.bot.sendPhoto(chatId, step.mediaUrl, { caption: text, parse_mode: 'HTML', ...replyMarkup })
                } else if (step.type === 'video') {
                    await this.bot.sendVideo(chatId, step.mediaUrl, { caption: text, parse_mode: 'HTML', ...replyMarkup })
                }
            } catch (error) {
                console.error(`❌ Erro ao enviar passo ${step.order} do fluxo "${flow.slug}":`, error.message)
                break
            }

            run.maxStepOrderReached = Math.max(run.maxStepOrderReached, step.order)

            const hasQuizButton = step.buttons?.some((b) => b.kind === 'quiz')
            if (step.waitForClick && hasQuizButton) {
                run.status = 'waiting'
                run.waitingStepOrder = step.order
                run.waitingUntil = step.timeoutSeconds ? new Date(Date.now() + step.timeoutSeconds * 1000) : undefined
                await run.save()
                return
            }

            await run.save()
        }

        run.status = 'completed'
        run.completedAt = new Date()
        await run.save()
    }

    // Retoma um run pausado, seja pelo passo indicado explicitamente (goToStep de
    // um botão) ou pelo próximo passo sequencial quando nenhum destino é definido.
    async resumeRun(run, flow, nextOrder) {
        const resumed = await TelegramFlowRun.findOneAndUpdate(
            { _id: run._id, status: 'waiting' },
            { status: 'in_progress', waitingStepOrder: null, waitingUntil: null },
            { new: true }
        )
        if (!resumed) return // já foi retomado por outro caminho (clique x timeout em corrida)

        await this.runFlow(resumed.chatId, flow, resumed, nextOrder)
    }

    async handleCallbackQuery(query) {
        const [runId, stepOrderRaw, buttonIndexRaw] = (query.data || '').split(':')
        const stepOrder = Number(stepOrderRaw)
        const buttonIndex = Number(buttonIndexRaw)
        if (!runId || Number.isNaN(stepOrder) || Number.isNaN(buttonIndex)) return

        const run = await TelegramFlowRun.findOne({ _id: runId, status: { $in: ['in_progress', 'waiting'] } })
        if (!run) return

        const flow = await TelegramFlow.findById(run.flowId)
        const step = flow?.steps.find((s) => s.order === stepOrder)
        const button = step?.buttons?.[buttonIndex]
        if (!button) return

        run.buttonClicks.push({
            stepOrder,
            buttonLabel: button.label,
            buttonKind: button.kind
        })
        await run.save()

        // Se o fluxo estava pausado esperando exatamente esse clique, retoma o envio
        if (run.status === 'waiting' && run.waitingStepOrder === stepOrder && button.kind === 'quiz') {
            const nextOrder = button.goToStep ?? stepOrder + 1
            await this.resumeRun(run, flow, nextOrder)
        }
    }

    // Varre runs parados em 'waiting' cujo timeout expirou e segue pro caminho padrão
    async sweepTimeouts() {
        if (!this.enabled) return

        try {
            const overdue = await TelegramFlowRun.find({ status: 'waiting', waitingUntil: { $lte: new Date() } })

            for (const run of overdue) {
                const flow = await TelegramFlow.findById(run.flowId)
                if (!flow) continue

                const step = flow.steps.find((s) => s.order === run.waitingStepOrder)
                const nextOrder = step?.timeoutGoToStep ?? (run.waitingStepOrder + 1)

                await this.resumeRun(run, flow, nextOrder)
            }
        } catch (error) {
            console.error('❌ Erro no sweep de timeout do Flow Bot:', error.message)
        }
    }

    startTimeoutSweep() {
        if (!this.enabled) return
        setInterval(() => this.sweepTimeouts(), 30 * 1000)
    }
}

export default new TelegramFlowBotService()
