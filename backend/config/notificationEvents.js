import dotenv from 'dotenv'
dotenv.config()

export const EVENT_TYPES = {
  NEW_USER: 'new_user',
  SUBSCRIPTION_PAID: 'subscription_paid',
  AFFILIATE_COMMISSION: 'affiliate_commission',
  AFFILIATE_PAGE_ACCESS: 'affiliate_page_access',
  WEBHOOK_RECEIVED: 'webhook_received',
  WEBHOOK_PROCESSED: 'webhook_processed',
  WEBHOOK_FAILED: 'webhook_failed',
  WITHDRAW_DONE: 'withdraw_done',
  WITHDRAW_FAILED: 'withdraw_failed'
};

export const EMOJIS = {
  NEW_USER: '👤',
  SUBSCRIPTION_PAID: '💰',
  AFFILIATE_COMMISSION: '💸',
  AFFILIATE_PAGE_ACCESS: '👀',
  WEBHOOK_RECEIVED: '📥',
  WEBHOOK_PROCESSED: '✅',
  WEBHOOK_FAILED: '❌',
  WITHDRAW_DONE: '💵',
  WITHDRAW_FAILED: '⚠️'
};

export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
  enabled: process.env.ENABLE_TELEGRAM_NOTIFICATIONS !== 'false'
};