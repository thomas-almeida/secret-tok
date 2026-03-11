# Backend - Secret Tok

Este documento descreve a arquitetura, as regras de negócio e os fluxos técnicos do backend do projeto Secret Tok.

## 🚀 Visão Geral
O backend é uma API REST construída com **Node.js** e **Express**, utilizando **MongoDB** (via Mongoose) como banco de dados. A aplicação integra-se com o **AbacatePay** para processamento de pagamentos via Pix e utiliza o **Telegram** para notificações em tempo real.

---

## 🏗️ Arquitetura e Estrutura
- **Controllers:** Lógica de manipulação de requisições e respostas.
- **Models:** Definições de esquemas de dados (Mongoose).
- **Routes:** Definição dos endpoints da API.
- **Services:** Lógica de negócio isolada (comissões, notificações, e-mail).
- **Middleware:** Funções intermediárias (ex: logger de notificações, check de banco).

---

## 👥 Entidades Principais

### 1. **User (Usuários, Admins e Afiliados)**
Representa as entidades administrativas e de vendas do sistema.
- **Admins:** Têm acesso ao dashboard total.
- **Afiliados/Criadores:** Possuem um objeto `revenue` que rastreia saldo, sessões e transações. Podem ter uma "Modelo Fake" personalizada.
- **Campos CRM:** `contactStatus` (a iniciar, enviado, respondido) e `funil` (indiferente, negativo, positivo).

### 2. **Customer (Clientes/Assinantes)**
Representa os leads ou usuários finais que compram acesso à plataforma.
- Identificados principalmente por `email`.
- Possuem um objeto `subscription` que indica se o acesso está ativo e qual o plano.

### 3. **Models (Influenciadores)**
Modelos reais ou fictícias exibidas no feed.
- Contêm nome, descrição, foto de perfil e uma lista de vídeos (`videoDataSchema`).

### 4. **Transactions (Transações)**
Registros de tentativas de pagamento.
- Vinculadas a um `userId` (Customer) e opcionalmente a um `referenceId` (Afiliado).
- Estados: `PENDING`, `PAID`, `FAILED`.

---

## 💰 Fluxos de Negócio

### 1. Fluxo de Assinatura e Pagamento (AbacatePay)
1. O frontend solicita a criação de um checkout (`createPaymentIntent`).
2. O sistema verifica se há um afiliado (`referenceId`). Se sim, aplica os **preços customizados** definidos pelo afiliado.
3. Um QR Code Pix é gerado via API do AbacatePay.
4. Uma transação é criada com status `PENDING`.

### 2. Confirmação de Pagamento e Comissão
A confirmação ocorre via **Webhook** ou **Polling** (checagem manual):
1. O status da transação é atualizado para `PAID`.
2. A assinatura do `Customer` é ativada (`active: true`).
3. **Cálculo de Comissão:**
   - O sistema identifica o afiliado (via `referenceId` ou `modelUsername`).
   - Aplica a comissão (padrão: **90%**).
   - O saldo (`balance`) do afiliado é incrementado.
   - O `Customer` é adicionado à lista de `associatedUsers` do afiliado.
   - A taxa de conversão do afiliado é recalculada.
4. Notificações são enviadas via Telegram e E-mail.

### 3. Sistema de Afiliados (Fake Models)
Cada afiliado pode configurar sua própria página de "venda":
- **Custom Model:** Nome exibido, descrição, fotos e link do Instagram.
- **Custom Plans:** Preços personalizados para os planos Mensal e Vitalício.
- **Tracking:** O sistema registra `sessions` (visitas) para calcular a performance do funil.

---

## 🤖 Notificações (Telegram)
O sistema envia alertas automáticos para:
- 👤 Novo usuário cadastrado.
- 💰 Pagamento de assinatura aprovado.
- 💸 Comissão gerada para afiliado.
- 👀 Acesso à página de dashboard de afiliado.
- 📥 Recebimento, sucesso ou falha de Webhooks.
- 💵 Status de saques (Withdrawals).

---

## 🛠️ Configurações Importantes
- **Planos:** Definidos em `backend/config/plans.js` (Mensal e Vitalício).
- **Eventos:** Mapeados em `backend/config/notificationEvents.js`.
- **Pool de Conexão:** MongoDB configurado com `maxPoolSize: 10`.

---

## 📡 Endpoints Principais (API)

### Autenticação e Pagamentos (`/api/auth`)
- `POST /login`: Autenticação de usuários/admins.
- `POST /create-payment-intent`: Inicia fluxo de pagamento Pix.
- `POST /abacate-webhook`: Recebe confirmações do gateway.
- `GET /check-transaction/:gatewayId`: Verifica status manual.

### Usuários e CRM (`/api/users`)
- `POST /create`: Cadastro de novo User/Afiliado.
- `POST /customer`: Cadastro de novo Customer (lead).
- `GET /overview`: Listagem geral para admin (performance).
- `PUT /update-crm`: Atualiza status de contato e funil.
- `GET /afiliate/:afiliateId`: Dados de saldo e transações do afiliado.
- `PUT/:userId/custom-plans`: Define preços personalizados.
- `PUT/:userId/custom-model`: Configura modelo fake.

### Modelos e Vídeos (`/api/models`)
- `GET /get-all-models`: Lista modelos do sistema.
- `POST /create`: Cria nova modelo.
- `POST /:modelId/videos`: Adiciona vídeo à modelo.
