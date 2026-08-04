import { TELEGRAM_FLOW_CONFIG } from "../config/telegramFlowConfig.js"
import telegramFlowBotService from "../services/telegramFlowBotService.js"

export const receiveWebhook = async (req, res) => {
    const { secret } = req.params

    if (!TELEGRAM_FLOW_CONFIG.webhookSecret || secret !== TELEGRAM_FLOW_CONFIG.webhookSecret) {
        return res.sendStatus(404)
    }

    // Responde imediatamente: o Telegram exige retorno rápido do webhook
    res.sendStatus(200)

    try {
        telegramFlowBotService.handleUpdate(req.body)
    } catch (error) {
        console.error('❌ Erro ao processar update do Telegram Flow Bot:', error.message)
    }
}
