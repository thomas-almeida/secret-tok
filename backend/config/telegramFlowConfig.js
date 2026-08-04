import dotenv from 'dotenv'
dotenv.config()

export const TELEGRAM_FLOW_CONFIG = {
    botToken: process.env.TELEGRAM_FLOW_BOT_TOKEN,
    botUsername: process.env.TELEGRAM_FLOW_BOT_USERNAME,
    webhookSecret: process.env.TELEGRAM_FLOW_WEBHOOK_SECRET,
    publicBaseUrl: process.env.PUBLIC_BASEURL
}
