# Como publicar o app na Vercel

Este documento descreve os passos para colocar o **Pulse** (app de controle financeiro) em produção na Vercel.

---

## 0. Criar repositório no GitHub e enviar o código

1. **Criar o repositório no GitHub**
   - Acesse [github.com](https://github.com) e faça login (conta do Rafael).
   - Clique em **+** (canto superior direito) → **New repository**.
   - Nome sugerido: `pulse` ou `financeiro`.
   - Deixe **público** (ou privado, como preferir).
   - **Não** marque “Add a README” (o projeto já tem um).
   - Clique em **Create repository**.

2. **Enviar o projeto da pasta Financeiro para o repositório**
   - No terminal, entre na pasta **Financeiro** (a que contém `app/` e `docs/`). Exemplo:
   ```bash
   cd "caminho/para/Financeiro"   # ajuste o caminho
   git init
   git add .
   git commit -m "Pulse — app controle financeiro"
   git branch -M main
   git remote add origin https://github.com/rafael/SEU_REPO.git
   git push -u origin main
   ```
   - Troque `rafael` pelo seu usuário do GitHub e `SEU_REPO` pelo nome do repositório que você criou (ex.: `pulse`).

---

## 1. O que subir no GitHub

**Suba a pasta inteira do projeto (Financeiro).**

- O repositório deve conter:
  - **`app/`** – aplicação Next.js (código, `package.json`, `public/`, `src/`, configs).
  - **`docs/`** – documentação (este arquivo, design system, `schema_banco.sql`).
  - **`README.md`** – na raiz do repositório.

Não suba:
- `app/node_modules/` (já deve estar no `.gitignore`).
- `app/.next/` (build; já no `.gitignore`).
- Arquivos `.env` ou `.env.local` (nunca versionar; configure na Vercel).
- `.venv/` ou outros arquivos locais de desenvolvimento.

Ou seja: **um repositório com a pasta Financeiro completa**, mas só o que for código e documentação. A Vercel vai usar a subpasta `app` como raiz do projeto (veja abaixo).

---

## 2. Comandos no seu computador (antes de publicar)

### Instalar dependências

```bash
cd app
npm install
```

### Rodar em desenvolvimento

```bash
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000) (ou 3001 se 3000 estiver em uso).

### Build de produção (testar antes de publicar)

```bash
npm run build
```

Se der certo, a pasta `app/.next` é gerada. Não é preciso commitar essa pasta.

### Iniciar em modo produção (opcional)

```bash
npm run start
```

---

## 3. Configurar na Vercel

### 3.1 Criar o projeto

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. **Add New** → **Project**.
3. **Import** do seu repositório GitHub (conecte a conta se ainda não estiver).
4. Selecione o repositório onde está o projeto Financeiro.

### 3.2 Root Directory (importante)

- Em **Root Directory**, clique em **Edit** e defina: **`app`**.
- Assim a Vercel usa só a pasta do Next.js; o **Framework Preset** deve ser detectado como **Next.js**.

### 3.3 Build and Output Settings

Deixe os padrões do Next.js:

- **Build Command:** `npm run build` (ou `next build`).
- **Output Directory:** (padrão do Next.js, não precisa alterar).
- **Install Command:** `npm install`.

Não é necessário configurar comando de “start”; a Vercel usa o build estático/serverless do Next.js.

### 3.4 Variáveis de ambiente

Em **Environment Variables** do projeto na Vercel, adicione:

| Nome | Valor | Observação |
|------|--------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (ex.: `https://xxxx.supabase.co`) | Obrigatório para produção |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave **service_role** do Supabase (Settings → API) | Obrigatório para produção |
| `GROQ_API_KEY` | Sua chave da API Groq | Necessário para a IA (chat) |

- Marque para **Production** (e opcionalmente Preview se quiser).
- Não coloque aspas no valor.

### 3.5 Deploy

- Clique em **Deploy**.
- A Vercel vai rodar `npm install` e `npm run build` na pasta `app`.
- Ao terminar, você recebe uma URL (ex.: `seu-app.vercel.app`).

---

## 4. Supabase (obrigatório para dados reais)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute **todo** o conteúdo do arquivo **`docs/schema_banco.sql`** do repositório (cria tabelas e categorias padrão).
3. Em **Settings → API** do projeto Supabase:
   - **Project URL** → use em `NEXT_PUBLIC_SUPABASE_URL`.
   - **service_role** (secret) → use em `SUPABASE_SERVICE_ROLE_KEY`.
4. Depois do primeiro deploy, abra o app em produção → **Config** → use o botão **“Preparar mês atual (Supabase)”** se existir, para criar o mês no banco.

---

## 5. Resumo dos comandos

| Onde | Comando |
|------|--------|
| Local (dev) | `cd app` → `npm install` → `npm run dev` |
| Local (build) | `cd app` → `npm run build` |
| Local (produção) | `cd app` → `npm run start` |
| Vercel | Root Directory = **`app`**; Build = `npm run build`; variáveis acima. |

---

## 6. Organização em uma pasta só

Se quiser **tudo em um único repositório**:

- Estrutura atual já serve: **raiz = Financeiro** (com `app/` e `docs/`).
- No GitHub: sobe a **pasta Financeiro inteira** (como raiz do repo).
- Na Vercel: define **Root Directory = `app`**.

Assim você mantém documentação e app no mesmo repositório, e a Vercel publica só o app a partir de `app/`.
