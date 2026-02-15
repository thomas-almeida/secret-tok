import TelegramBot from 'node-telegram-bot-api';
import { EVENT_TYPES, EMOJIS, TELEGRAM_CONFIG } from '../config/notificationEvents.js';

class NotificationService {
  constructor() {
    this.bot = null;
    this.enabled = TELEGRAM_CONFIG.enabled && TELEGRAM_CONFIG.botToken && TELEGRAM_CONFIG.chatId;

    if (this.enabled) {
      this.initializeBot();
    }
  }

  initializeBot() {
    try {
      this.bot = new TelegramBot(TELEGRAM_CONFIG.botToken);
      console.log('🤖 Telegram Bot initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Telegram Bot:', error.message);
      this.enabled = false;
    }
  }

  async sendMessage(eventType, data) {
    if (!this.enabled || !this.bot) {
      console.log(`📝 [LOG] ${eventType}:`, data);
      return;
    }

    try {
      const message = this.formatMessage(eventType, data);
      await this.bot.sendMessage(TELEGRAM_CONFIG.chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
      console.log(`✅ Telegram notification sent for ${eventType}`);
    } catch (error) {
      console.error(`❌ Failed to send Telegram notification for ${eventType}:`, error.message);
    }
  }

  formatMessage(eventType, data) {
    const emoji = EMOJIS[eventType] || '📢';
    const timestamp = new Date().toLocaleString('pt-BR');

    switch (eventType) {
      case EVENT_TYPES.NEW_USER:
        return `${emoji} *Novo Usuário Cadastrado*\n\n` +
          `👤 *Nome:* ${data.name}\n` +
          `📧 *Email:* ${data.email}\n` +
          `📱 *Telefone:* ${data.phone}\n` +
          `📅 *Data:* ${timestamp}`;

      case EVENT_TYPES.SUBSCRIPTION_PAID:
        return `${emoji} *Pagamento Aprovado!*\n\n` +
          `👤 *Usuário:* ${data.userName || data.userId}\n` +
          `💳 *Plano:* ${data.planId}\n` +
          `💰 *Valor:* R$ ${data.amount}\n` +
          `🆔 *Transação:* ${data.transactionId || data.gatewayId}\n` +
          `📅 *Data:* ${timestamp}`;

      case EVENT_TYPES.AFFILIATE_COMMISSION:
        return `${emoji} *Comissão Paga ao Afiliado!*\n\n` +
          `👤 *Afiliado ID:* ${data.affiliateId}\n` +
          `🆔 *Usuário Referenciado:* ${data.userId}\n` +
          `💰 *Comissão:* R$ ${data.commissionAmount}\n` +
          `📊 *Percentual:* ${data.percentage * 100}%\n` +
          `👥 *Total Referenciados:* ${data.totalAssociated}\n` +
          `💵 *Saldo Atual:* R$ ${data.currentBalance}\n` +
          `📅 *Data:* ${timestamp}`;

      case EVENT_TYPES.AFFILIATE_PAGE_ACCESS:
        return `${emoji} *Acesso à Página de Afiliado*\n\n` +
          `👤 *Usuário:* ${data.userName || data.userId}\n` +
          `📧 *Email:* ${data.userEmail}\n` +
          `💰 *Saldo Atual:* R$ ${data.balance}\n` +
          `👥 *Referenciados:* ${data.associatedUsers}\n` +
          `📅 *Data:* ${timestamp}`;

      case EVENT_TYPES.WEBHOOK_RECEIVED:
        return `${emoji} *Webhook Recebido*\n\n` +
          `\`\`\`\nEvento: ${data.eventId}\nTipo: ${data.eventType}\nGateway: ${data.gatewayId || 'N/A'}\n\`\`\`\n📅 ${timestamp}`;

      case EVENT_TYPES.WEBHOOK_PROCESSED:
        return `${emoji} *Webhook Processado*\n\n` +
          `\`\`\`\nEvento: ${data.eventId}\nTipo: ${data.eventType}\nGateway: ${data.gatewayId || 'N/A'}\nValor: ${data.amount ? `R$ ${data.amount}` : 'N/A'}\nUsuario: ${data.userId || 'N/A'}\n\`\`\`\n📅 ${timestamp}`;

      case EVENT_TYPES.WEBHOOK_FAILED:
        return `${emoji} *Webhook Falhou*\n\n` +
          `\`\`\`\nEvento: ${data.eventId}\nTipo: ${data.eventType}\nErro: ${data.error}\n\`\`\`\n📅 ${timestamp}`;

      case EVENT_TYPES.WITHDRAW_DONE:
        return `${emoji} *Saque Realizado*\n\n` +
          `🆔 *Transação:* ${data.transactionId}\n` +
          `💰 *Valor:* R$ ${data.amount}\n` +
          `📊 *Taxa:* R$ ${data.fee}\n` +
          `🔗 *Recibo:* ${data.receiptUrl}\n` +
          `📅 *Data:* ${timestamp}`;

      case EVENT_TYPES.WITHDRAW_FAILED:
        return `${emoji} *Saque Falhou*\n\n` +
          `🆔 *Transação:* ${data.transactionId}\n` +
          `💰 *Valor:* R$ ${data.amount}\n` +
          `❌ *Status:* ${data.status}\n` +
          `📅 *Data:* ${timestamp}`;

      default:
        return `${emoji} *Evento:* ${eventType}\n\n` +
          `📊 *Dados:* ${JSON.stringify(data, null, 2)}\n` +
          `📅 *Data:* ${timestamp}`;
    }
  }

  logOnly(eventType, data) {
    const timestamp = new Date().toLocaleString('pt-BR');
    console.log(`📝 [${timestamp}] ${eventType}:`, data);
  }
}

export default new NotificationService();