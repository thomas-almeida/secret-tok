# Secret-Tok Frontend - Contexto do Projeto

## 📌 Visão Geral
O **Secret-Tok** é uma plataforma de entretenimento adulto baseada em vídeos curtos, inspirada na experiência de consumo do TikTok, mas focada em conversão e monetização de criadores (modelos). A aplicação oferece um feed infinito de vídeos, sistema de assinaturas, painel de afiliados e área administrativa.

## 🛠 Tech Stack Core
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Gerenciamento de Estado:** [Zustand](https://zustand-demo.pmnd.rs/) (localizado em `app/stores/`)
- **Estilização:** Tailwind CSS
- **Validação de Schemas:** Zod (provavelmente usado em `app/schemas/`)
- **Consumo de API:** Services customizados em `app/services/`

## 📂 Estrutura de Pastas Chave
- `app/admin`: Dashboard de gestão da plataforma.
- `app/ads`: Sistema de exibição de anúncios/parcerias.
- `app/afiliate`: Área dedicada a parceiros que promovem a plataforma.
- `app/components`: Componentes atômicos e complexos (UI).
- `app/components/modal`: Lógica de modais (Login, Assinatura, Verificação de Idade).
- `app/hooks`: Hooks customizados para lógica de vídeo e tradução.
- `app/model/[username]`: Perfil público/privado da modelo.
- `app/services`: Camada de abstração para chamadas de API (Admin, User, Payments, etc).
- `public/videos`: Armazenamento local de assets de vídeo para demonstração e cache.

## 🚀 Fluxos Principais
1. **Feed de Vídeos:** O coração da app. Usa `useVideoQueue` para gerenciar a fila de reprodução e `video-feed` para renderização.
2. **Funil de Conversão:** Usuários assistem vídeos e são impactados pelo `subscription-modal` ou `adult-modal`.
3. **Sistema de Afiliados:** Rastreamento via `useAffiliateCode` para atribuição de vendas.
4. **Streaming de Vídeo:** Implementado via API Route em `api/video/` para possivelmente mascarar URLs ou gerenciar permissões.

## 🎨 Padrões de Desenvolvimento
- **Surgical Updates:** Ao editar componentes, manter a fidelidade aos estilos existentes.
- **Service Pattern:** Toda lógica de busca de dados deve residir em `app/services/`.
- **Typing:** Strict TypeScript. Interfaces devem ser definidas ou aproveitadas dos schemas.

## ⚠️ Observações de Segurança
- Não expor chaves de API no front-end.
- Verificação de idade (`adult-modal`) é mandatória no acesso inicial.
