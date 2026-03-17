# Pulse — Controle financeiro pessoal

App web para planejamento financeiro mensal: categorias, lançamentos, resumo e assistente com IA. Backend em **Supabase** (PostgreSQL), deploy na **Vercel**, instalável no celular (PWA).

## Estrutura do repositório

- **`app/`** – aplicação Next.js (código do app).
- **`docs/`** – documentação:
  - **DEPLOY_VERCEL.md** – como publicar na Vercel (comandos, Root Directory, variáveis).
  - **schema_banco.sql** – schema do banco para rodar no Supabase (SQL Editor).
  - **DESIGN_SYSTEM_APP_FINANCEIRO.md** – design system e UX do app.

## Publicar na Vercel

1. Suba **este repositório inteiro** (pasta Financeiro com `app/` e `docs/`) no GitHub.
2. Na Vercel: importe o repo e defina **Root Directory** = **`app`**.
3. Configure as variáveis de ambiente (Supabase e, se usar IA, Groq).
4. Detalhes: **[docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)**.

## Desenvolvimento local

```bash
cd app
npm install
cp .env.example .env.local
# Edite .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Mais detalhes em **[app/README.md](app/README.md)**.
