# 🤖 Sistema de Notificações Telegram

## 📋 Visão Geral

Sistema de notificações em tempo real via Telegram para eventos importantes da aplicação. Funciona como um "oráculo" que informa sobre ações críticas dos usuários.

## 🔧 Eventos Monitorados

- **👤 Novo Usuário Cadastrado** - Quando um novo usuário se registra no sistema
- **💰 Pagamento Aprovado** - Quando uma assinatura é ativada com sucesso  
- **💸 Comissão Paga** - Quando um afiliado recebe comissão
- **👀 Acesso à Página Afiliado** - Quando alguém acessa a página de afiliados

## 📁 Estrutura de Arquivos

```
backend/
├── services/
│   └── notificationService.js    # Serviço principal de notificações
├── middleware/
│   └── notificationLogger.js     # Middleware para detectar acessos
├── config/
│   └── notificationEvents.js     # Configuração de eventos e constantes
└── .env                          # Variáveis de ambiente
```

## 🔑 Configuração

### 1. Criar Bot no Telegram
1. Converse com [@BotFather](https://t.me/BotFather)
2. Use `/newbot` e siga as instruções
3. Copie o token do bot

### 2. Obter Chat ID
1. Converse com seu bot recém-criado
2. Envie uma mensagem qualquer
3. Acesse: `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Copie o `chat.id` da resposta

### 3. Configurar Variáveis de Ambiente

No arquivo `.env`:
```env
# Telegram Notifications
TELEGRAM_BOT_TOKEN=SEU_BOT_TOKEN_AQUI
TELEGRAM_CHAT_ID=SEU_CHAT_ID_AQUI
ENABLE_TELEGRAM_NOTIFICATIONS=true
```

## 🚀 Como Funciona

### Fluxo de Notificação
1. **Evento Ocorre** - Usuário realiza ação no sistema
2. **Controller Detecta** - Código identifica evento importante
3. **Serviço Formata** - Message formatada com Markdown
4. **Telegram Envia** - Notificação enviada em tempo real
5. **Fallback Local** - Se falhar, log local é mantido

### Exemplos de Mensagens

#### Novo Usuário
```
👤 Novo Usuário Cadastrado

👤 Nome: João Silva
📧 Email: joao@email.com  
📱 Telefone: 11999999999
📅 Data: 03/02/2026 15:30:00
```

#### Pagamento Aprovado
```
💰 Pagamento Aprovado!

👤 Usuário: Maria Santos
💳 Plano: premium
💰 Valor: R$ 97.00
🆔 Transação: 507f1f77bcf86cd799439011
📅 Data: 03/02/2026 15:30:00
```

#### Comissão Afiliado
```
💸 Comissão Paga ao Afiliado!

👤 Afiliado ID: 507f1f77bcf86cd799439011
🆔 Usuário Referenciado: 507f1f77bcf86cd799439012
💰 Comissão: R$ 33.95
📊 Percentual: 35%
👥 Total Referenciados: 15
💵 Saldo Atual: R$ 1500.00
📅 Data: 03/02/2026 15:30:00
```

## 🛡️ Segurança e Boas Práticas

- **Não-bloqueante** - Notificações não afetam performance
- **Rate limiting** - Proteção contra excesso de mensagens
- **Graceful degradation** - Fallback para logs locais
- **Sem dados sensíveis** - Senhas e tokens nunca são logados
- **Error handling** - Tratamento robusto de falhas

## 🔧 Testes

Para testar o sistema:

```bash
# Iniciar servidor
npm run dev

# Verificar logs de inicialização
# Deverá aparecer: "🤖 Telegram Bot initialized successfully"
```

Se as variáveis não estiverem configuradas, o sistema funcionará apenas com logs locais:
```
📝 [LOG] new_user: { name: "Test", email: "test@email.com", ... }
```

## 🎯 Pontos de Integração

### Controllers Modificados
- `userController.js` - Novo usuário cadastrado
- `subscriptionController.js` - Pagamentos e comissões
- `userRoutes.js` - Middleware de acesso afiliado

### Eventos e Locais
- **createUser()** → `EVENT_TYPES.NEW_USER`
- **checkTransactionStatus()** → `EVENT_TYPES.SUBSCRIPTION_PAID`
- **checkTransactionStatus()** → `EVENT_TYPES.AFFILIATE_COMMISSION`
- **GET /api/users/afiliate/:id** → `EVENT_TYPES.AFFILIATE_PAGE_ACCESS`

## 🚨 Desabilitar Notificações

Para desabilitar temporariamente:
```env
ENABLE_TELEGRAM_NOTIFICATIONS=false
```

Ou remova as variáveis `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`.