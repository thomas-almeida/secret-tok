import express from "express"
import { receiveWebhook } from "../controllers/telegramBotController.js"

const router = express.Router()

router.post("/webhook/:secret", receiveWebhook)     // POST /api/telegram-bot/webhook/:secret - Recebe updates do Telegram

export default router
