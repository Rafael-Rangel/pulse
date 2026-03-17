# App Planejamento Financeiro

App web para controle financeiro mensal: ver quanto pode gastar por dia, categorias, lançamentos e gráficos. Usa **Supabase** (PostgreSQL) como backend e pode ser instalado no celular (PWA).

## Deploy na Vercel

Passo a passo completo (comandos, Root Directory, variáveis): **[../docs/DEPLOY_VERCEL.md](../docs/DEPLOY_VERCEL.md)**.

Resumo: envie o repositório **inteiro** (pasta Financeiro com `app/` e `docs/`) para o GitHub; na Vercel defina **Root Directory** = `app` e configure `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e, se usar IA, `GROQ_API_KEY`.

3. **Usar no celular como app**
   - Abra o site no navegador do celular (Chrome/Safari).
   - **Android:** menu (⋮) → "Adicionar à tela inicial" ou "Instalar app".
   - **iOS:** Safari → compartilhar → "Adicionar à tela de início".
   - O ícone aparecerá na tela inicial e abrirá em tela cheia.

## Configurar o Supabase (obrigatório para produção)

1. **Criar projeto**
   - Acesse [supabase.com](https://supabase.com) e crie um novo projeto.

2. **Rodar o schema (obrigatório)**
   - No painel do projeto: **SQL Editor** → New query.
   - Copie **todo** o conteúdo do arquivo **docs/schema_banco.sql** (no repositório) e execute no SQL Editor do Supabase.
   - Execute a query. Isso cria as tabelas `meses`, `categorias`, `planejamentos`, `lancamentos`, `remanejamentos`, `chat_conversas`, `chat_mensagens` e insere as 10 categorias padrão.
   - Se você já tinha rodado o schema antes: execute só o bloco que cria `chat_conversas` e `chat_mensagens` (e o índice) para ter histórico do chat da IA.
   - Sem esse passo, `/api/health` retorna `supabase: "error"` e o app não consegue salvar dados.

3. **Variáveis de ambiente**
   - Em **Settings → API**: use **Project URL** como `NEXT_PUBLIC_SUPABASE_URL` e **service_role** (secret) como `SUPABASE_SERVICE_ROLE_KEY`.
   - Configure no `.env.local` (local) e nas variáveis do projeto na Vercel.

4. **Preparar o mês atual**
   - Depois do primeiro deploy ou ao rodar local, abra o app → **Config** → botão **"Preparar mês atual (Supabase)"** para criar o registro do mês no banco.

## Groq (opcional)

Para usar a **Groq** em alguma função com IA no futuro:

1. Crie uma chave em [console.groq.com](https://console.groq.com/).
2. Adicione no ambiente (local e Vercel):  
   `GROQ_API_KEY=sua_chave`

O app está preparado para usar essa variável quando você implementar a feature.

## Rodar localmente

```bash
cd app
cp .env.example .env.local
# Edite .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000). Sem as variáveis do Supabase, o app usa dados de exemplo (modo demo).

## Verificar modo produção

- Acesse **GET /api/health** (ex.: `http://localhost:3000/api/health` ou `https://seu-app.vercel.app/api/health`).
- Resposta esperada em produção: `{ "ok": true, "mode": "production", "supabase": "ok" }`.
- Se `mode` for `"demo"`, as variáveis de ambiente do Supabase não estão definidas.
- Se `supabase` for `"error"`, confira a chave e a URL ou se o schema foi executado no Supabase (SQL Editor com **docs/schema_banco.sql**).
