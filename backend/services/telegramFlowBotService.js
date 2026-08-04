import TelegramBot from 'node-telegram-bot-api'
import TelegramFlow from '../models/TelegramFlow.js'
import TelegramContact from '../models/TelegramContact.js'
import TelegramFlowRun from '../models/TelegramFlowRun.js'
import { TELEGRAM_FLOW_CONFIG } from '../config/telegramFlowConfig.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Converte **negrito** (Markdown comum) pro formato HTML que o Telegram entende,
// escapando antes os caracteres reservados de HTML pra não quebrar o parse_mode.
function formatTelegramText(text) {
    if (!text) return text

    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    return escaped.replace(/\*\*(.+?)\*\*/gs, '<b>$1</b>')
}

class TelegramFlowBotService {
    constructor() {
        this.bot = null
        this.enabled = Boolean(TELEGRAM_FLOW_CONFIG.botToken)

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

    buildReplyMarkup(step) {
        if (!step.buttons || step.buttons.length === 0) return {}

        const inline_keyboard = [step.buttons.map((button, index) => {
            if (button.kind === 'url') {
                return { text: button.label, url: button.url }
            }
            return { text: button.label, callback_data: `${step.order}:${index}` }
        })]

        return { reply_markup: { inline_keyboard } }
    }

    async runFlow(chatId, flow, run) {
        const steps = [...flow.steps].sort((a, b) => a.order - b.order)

        for (const step of steps) {
            if (step.delaySeconds > 0) {
                await delay(step.delaySeconds * 1000)
            }

            const replyMarkup = this.buildReplyMarkup(step)
            const text = formatTelegramText(step.text)

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
            await run.save()
        }

        run.status = 'completed'
        run.completedAt = new Date()
        await run.save()
    }

    async handleCallbackQuery(query) {
        const chatId = query.message?.chat?.id
        if (!chatId) return

        const [stepOrderRaw, buttonIndexRaw] = (query.data || '').split(':')
        const stepOrder = Number(stepOrderRaw)
        const buttonIndex = Number(buttonIndexRaw)
        if (Number.isNaN(stepOrder) || Number.isNaN(buttonIndex)) return

        const run = await TelegramFlowRun.findOne({ chatId, status: 'in_progress' }).sort({ startedAt: -1 })
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
    }
}

export default new TelegramFlowBotService()
