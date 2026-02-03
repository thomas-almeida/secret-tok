import dotenv from 'dotenv'
dotenv.config()

export const EVENT_TYPES = {
  NEW_USER: 'new_user',
  SUBSCRIPTION_PAID: 'subscription_paid',
  AFFILIATE_COMMISSION: 'affiliate_commission',
  AFFILIATE_PAGE_ACCESS: 'affiliate_page_access'
};

export const EMOJIS = {
  NEW_USER: '👤',
  SUBSCRIPTION_PAID: '💰',
  AFFILIATE_COMMISSION: '💸',
  AFFILIATE_PAGE_ACCESS: '👀'
};

export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
  enabled: process.env.ENABLE_TELEGRAM_NOTIFICATIONS !== 'false'
};