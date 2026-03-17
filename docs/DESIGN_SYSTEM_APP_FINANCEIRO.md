# Design System & Experiência — App de Controle Financeiro Pessoal

**Documento de design:** produto mobile-first, identidade visual, design system e UX para fintech moderna.  
Objetivo: **qualidade de produto de startup unicorn / fintech global** — experiência que faça o usuário **sentir prazer em acompanhar suas finanças**.

---

## Índice do documento

1. [Etapa 1 — Pesquisa de referências](#etapa-1--pesquisa-de-referências)
2. [Conceito da marca](#1-conceito-da-marca)
3. [Identidade visual](#2-identidade-visual)
4. [Design system](#3-design-system-mini)
5. [Estrutura das telas](#4-estrutura-das-telas)
6. [Fluxo de navegação](#5-fluxo-de-navegação)
7. [Gamificação](#6-gamificação)
8. [Motion design](#7-motion-design)
9. [Ideias de UX avançada](#8-ideias-de-ux-avançada)
10. [Inspirações de design](#9-referências-de-design)
11. [Design para implementação](#etapa-final--design-para-implementação)

---

# OBJETIVO DO APP

O app deve permitir:

| Funcionalidade | Como o design apoia |
|----------------|---------------------|
| Registrar receitas | FAB + sheet/tela "Adicionar" com tipo Receita; valor e categoria em destaque. |
| Registrar despesas | Mesmo fluxo; tipo Despesa; categorias visuais. |
| Categorizar gastos | Selector de categoria no fluxo de adição; lista e relatórios por categoria. |
| Visualizar saldo | Card hero na Home; "Disponível até dia X" claro. |
| Acompanhar evolução | Gráficos animados; resumo receitas vs despesas; barra do mês. |
| Relatórios e gráficos | Tela Relatórios com pizza/barras por categoria e período. |
| Definir metas | Tela Metas com cards e barras de progresso. |
| Acompanhar progresso | Home com metas próximas; indicadores e insights. |
| Hábitos financeiros saudáveis | Gamificação leve: streaks, badges, desafios mensais. |

**Meta de experiência:** transformar controle financeiro em algo **motivador e recompensador**, sem gerar ansiedade.

---

# PRINCÍPIOS DE UX

Prioridade absoluta para usuários que **não entendem de finanças**:

| Princípio | Aplicação no app |
|-----------|-------------------|
| **Extrema simplicidade** | Uma ação principal por tela; linguagem sem jargão. |
| **Ações rápidas** | FAB sempre visível; formulário de transação em poucos campos. |
| **Navegação intuitiva** | Bottom nav estável; no máximo 2 níveis de profundidade. |
| **Poucos cliques** | Saldo e "adicionar" em 1–2 toques; metas e relatórios em 1 toque. |
| **Leitura fácil** | Números grandes; contraste adequado; hierarquia clara. |
| **Hierarquia visual clara** | Um hero number por tela; seções bem separadas. |
| **Feedback visual imediato** | Toast ao salvar; animação em botões; progress bars animadas. |
| **Sensação de progresso** | Barras de metas; "X% do orçamento"; insights positivos. |
| **Engajamento constante** | Empty states motivadores; microcelebrações; sem telas mortas. |

---

# ETAPA 1 — PESQUISA DE REFERÊNCIAS

## Padrões identificados em apps líderes

### Navegação
- **Bottom navigation** com 4–5 itens (Nubank, Revolut, Mint, Mobills): Home, Transações/Conta, Metas/Orçamento, Relatórios, Perfil/Mais.
- **FAB** para ação principal (adicionar transação) — Nubank, Wallet, Spendee.
- **Gestos:** swipe para ações rápidas (excluir/editar), pull-to-refresh.
- **Hierarquia rasa:** poucos níveis; fluxo “lista → detalhe” ou “lista → sheet de ação”.

### Visualização financeira
- **Saldo em destaque** no topo (número grande, período claro) — Nubank, Monzo, Revolut.
- **Cards por contexto:** saldo total, “a receber”, “a pagar”, orçamento do mês.
- **Lista agrupada por data** (Hoje, Ontem, 11 mar…) — YNAB, Mint, Mobills.
- **Cores semânticas:** verde (entrada/saldo positivo), vermelho/âmbar (saída/alerta).

### Microinterações
- **Feedback ao salvar:** toast ou check animado (Nubank, Cleo).
- **Teclado numérico** para valor; máscara monetária em tempo real.
- **Seleção de categoria:** grid de ícones + nome; feedback visual imediato.
- **Progress bars** animadas ao carregar (Revolut, YNAB).

### Design emocional
- **Tom positivo:** “Você economizou” em vez de “Você não gastou demais” (Cleo, YNAB).
- **Celebração leve:** animação ao atingir meta; sem culpa em alertas.
- **Ilustrações** em empty states e onboarding (Nubank, Revolut).
- **Copy curto e humano:** “Tudo certo” / “Quase lá” / “Fechamento em 2 dias”.

### Gamificação
- **Metas com barra de progresso** (YNAB, Mobills, Spendee).
- **Badges/conquistas** (Mint, alguns wallets).
- **Streaks** ou “dias em dia” (hábitos).
- **Desafios mensais** opcionais (ex.: “Não estourar Mercado”).

### Dashboard financeiro
- **Um número hero** (saldo ou “disponível até dia X”).
- **Resumo visual:** receitas vs despesas; “quanto falta” ou “quanto passou”.
- **Próximas metas** em cards pequenos.
- **Últimas transações** (5–10) com link “Ver todas”.

## Melhores práticas aplicadas (mobile-first)

- Uma ação principal por tela (FAB ou CTA único).
- Formulários curtos; valor e categoria em destaque ao adicionar transação.
- Empty states com ilustração + CTA (nunca tela vazia sem explicação).
- Dark mode considerado nos tokens (cores e contraste).
- Acessibilidade: contraste mínimo, touch targets ≥ 44px, labels em inputs.

---

# ESTILO VISUAL (CHECKLIST)

O design deve ser:

| Atributo | Como garantir |
|----------|----------------|
| **Moderno** | Tipografia atual (Plus Jakarta / Inter), componentes com radius 12–16px, sombras suaves. |
| **Altamente animado** | Transições entre telas, gráficos e barras animados, feedback ao salvar. |
| **Minimalista** | Poucos elementos por tela; uma hero number; sem decoração desnecessária. |
| **Clean** | Muito espaço em branco; bordas e dividers sutis. |
| **Fintech style** | Roxo/índigo como primária; cards; números em destaque. |
| **Intuitivo** | Ícones reconhecíveis; labels claros; gestos comuns (pull to refresh, swipe). |
| **Agradável** | Cores suaves; ilustrações amigáveis; copy positivo. |
| **Fluido** | Animações 250–400ms; sem travamentos visuais. |
| **Mobile-first** | Touch targets ≥ 44px; bottom nav; FAB; conteúdo legível em 320px+. |
| **Emocionalmente positivo** | Verde para sucesso; âmbar para alerta (não vermelho punitivo); celebrações leves. |

**Evitar:** poluição visual, jargão, telas vazias sem explicação, feedback apenas negativo.

**Usar:** espaço em branco, hierarquia visual forte, componentes claros e consistentes.

---

# 1️⃣ CONCEITO DA MARCA

## Nome sugerido: **Pulse** (ou **Flux**, **Breeze**, **Clarity**)

*Pulse* transmite ritmo financeiro saudável, vida e consistência sem ser agressivo.

## Conceito da marca

- **O que é:** Um companheiro financeiro que transforma números em sensação de controle e progresso.
- **Promessa:** "Suas finanças em ritmo. Seu futuro em progresso."

## Propósito

Ajudar pessoas reais a criar hábitos financeiros sustentáveis sem julgamento, com clareza e motivação positiva.

## Personalidade

| Atributo    | Manifestação |
|------------|--------------|
| **Amigável** | Linguagem simples, sem jargão. |
| **Confiável** | Precisão, transparência, dados claros. |
| **Motivador** | Celebra pequenas vitórias, evita culpa. |
| **Moderno** | Visual limpo, animado, atual. |
| **Leve** | Tom positivo mesmo em alertas. |

## Tom visual

- **Cores:** Predominância de um primário forte (ex.: roxo/índigo fintech) com acentos verdes (sucesso/progresso) e neutros claros.
- **Formas:** Cantos arredondados (8–16px), cards flutuantes, poucas linhas duras.
- **Tipografia:** Sans-serif moderna, boa legibilidade, hierarquia clara (títulos bold, corpo regular).
- **Espaço:** Respiração, pouco ruído visual, foco no essencial.

---

# 2️⃣ IDENTIDADE VISUAL COMPLETA

## Definições da marca (resumo)

| Item | Definição |
|------|-----------|
| **Nome da marca** | Pulse (ou Flux, Breeze, Clarity). |
| **Conceito** | Companheiro financeiro que transforma números em controle e progresso. |
| **Propósito** | Ajudar a criar hábitos financeiros sustentáveis sem julgamento. |
| **Personalidade** | Amigável, confiável, motivador, moderno, leve. |
| **Tom visual** | Primária forte (índigo), acentos verdes, neutros claros; cantos arredondados; sans-serif; muito espaço. |

Detalhes em [Conceito da marca](#1-conceito-da-marca).

---

## Paleta principal

| Uso            | Nome       | Hex       | Uso em UI |
|----------------|------------|-----------|-----------|
| Primária       | Indigo     | `#6366F1` | CTAs, links, destaques |
| Primária escura| Indigo 800 | `#4F46E5` | Hover, pressed |
| Primária clara | Indigo 100 | `#E0E7FF` | Backgrounds suaves |

## Paleta secundária

| Uso     | Nome   | Hex       |
|---------|--------|-----------|
| Secundária | Teal  | `#14B8A6` |
| Secundária escura | Teal 700 | `#0F766E` |

## Cores semânticas

| Tipo    | Nome  | Hex       | Uso |
|---------|-------|-----------|-----|
| Sucesso | Green | `#22C55E` | Saldo positivo, meta atingida, economia |
| Alerta  | Amber | `#F59E0B` | Próximo do limite, atenção |
| Erro    | Red   | `#EF4444` | Estouro, débito |
| Info    | Blue  | `#3B82F6` | Informações, insights |

## Cores para gráficos

- Categoria 1: `#6366F1` (Indigo)
- Categoria 2: `#14B8A6` (Teal)
- Categoria 3: `#F59E0B` (Amber)
- Categoria 4: `#EC4899` (Pink)
- Categoria 5: `#8B5CF6` (Violet)
- Categoria 6+: tons derivados com mesma saturação

## Neutros (backgrounds e texto)

| Uso        | Hex       |
|------------|-----------|
| Background | `#F8FAFC` (claro) / `#0F172A` (dark) |
| Surface    | `#FFFFFF` / `#1E293B` |
| Texto primário | `#0F172A` / `#F1F5F9` |
| Texto secundário | `#64748B` / `#94A3B8` |
| Borda      | `#E2E8F0` / `#334155` |

## Tipografia recomendada

- **Títulos / números grandes:** **Plus Jakarta Sans** (Bold 600–700) ou **DM Sans**
- **Corpo / UI:** **Inter** ou **Plus Jakarta Sans** (Regular 400, Medium 500)
- **Monetário / dados:** **Tabular figures** (font-variant-numeric: tabular-nums)

Escala sugerida:

| Token    | Tamanho | Peso  | Uso |
|----------|---------|--------|-----|
| display  | 32–40px | Bold   | Saldo principal, hero numbers |
| h1       | 24–28px | Bold   | Título de tela |
| h2       | 20–22px | Semibold | Subtítulos, cards |
| body-lg  | 17px    | Regular | Texto principal |
| body     | 15–16px | Regular | Corpo padrão |
| body-sm  | 13–14px | Regular | Legendas, hints |
| caption  | 11–12px | Medium | Labels, badges |

## Ícones

- **Estilo:** Outline, stroke ~1.5–2px, cantos levemente arredondados.
- **Biblioteca:** Lucide, Phosphor ou Heroicons; manter uma única família no app.
- **Tamanhos:** 20px (inline), 24px (botões), 32px (empty states).

## Ilustrações

- **Estilo:** Flat ou semi-flat, traços suaves, 2–3 cores da paleta.
- **Uso:** Onboarding, empty states, conquistas.
- **Tom:** Amigável, minimalista, sem excesso de detalhe.

## Botões

- **Primário:** Fundo primária, texto branco, border-radius 12px, altura 48–56px.
- **Secundário:** Outline ou fundo neutro, texto primária.
- **Ghost:** Só texto/ícone para ações terciárias.
- **FAB:** Círculo 56px, primária, sombra média, para ação principal (ex.: adicionar lançamento).

## Sistema de espaçamento

Base **4px**. Escala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.

- Entre seções: 24–32px
- Dentro de cards: 16–20px
- Entre elementos relacionados: 8–12px

## Grid

- **Mobile:** 4 colunas virtuais, gutter 16px, margens 16–24px.
- **Tablet:** 8–12 colunas, mesmo gutter.
- Breakpoint principal: 768px (mobile-first).

---

# 3️⃣ DESIGN SYSTEM (MINI)

## Componentes

### Botões

- **Primary:** bg primária, altura 48px, padding horizontal 24px, radius 12px.
- **Secondary:** border 2px primária, bg transparente.
- **Destructive:** bg vermelho suave para excluir.
- Estados: default, hover, active, disabled (opacity 0.5).

### Inputs

- Altura 48–52px, border 1px neutro, radius 12px, padding 12–16px.
- Label acima ou floating; hint abaixo em corpo pequeno.
- Foco: border primária, optional ring 2px.

### Cards

- Background surface, radius 16px, padding 20px, sombra sutil (0 2px 8px rgba(0,0,0,0.06)).
- Variante “elevated”: sombra maior para destaque.

### Modais

- Max-width 400px no mobile, centralizado, overlay escuro 40–50% opacity.
- Header (título + fechar), body scrollável, footer com 1–2 CTAs.

### Bottom sheets

- Arraste para fechar; handle no topo; altura 50%–90% da tela.
- Uso: adicionar transação, filtros, ações rápidas.

### Listas

- Linhas mínimas 56px; ícone 24px à esquerda; título + subtítulo; optional trailing (valor, seta).
- Dividers sutis ou espaçamento entre itens.

### Navegação

- **Bottom nav:** 4–5 itens (Home, Transações, Metas, Relatórios, Mais).
- Ícone + label; item ativo com cor primária.
- Altura ~64px + safe area.

### Tabs

- Underline ou pill; animação de slide no indicador.
- Máximo 4–5 tabs; overflow horizontal com scroll se necessário.

### FAB

- 56px, posição fixa canto inferior direito, 16–24px da borda.
- Sombra: 0 4px 12px rgba(99, 102, 241, 0.4).

## Sistema de ícones

- **Família única:** Lucide, Phosphor ou Heroicons em todo o app.
- **Estilo:** outline, stroke ~1.5–2px, cantos levemente arredondados.
- **Tamanhos:** 20px (inline com texto), 24px (botões e listas), 32px (empty states e ilustrações pequenas).
- **Cor:** herdar do texto ou usar `--color-primary` para ícones ativos/destaque.

## Estados

- **Loading:** Skeleton (shimmer) ou spinner centralizado; evitar blocos estáticos.
- **Empty:** Ilustração + título + descrição + CTA (ex.: “Adicione sua primeira despesa”).
- **Erro:** Ícone + mensagem + botão “Tentar de novo”.
- **Sucesso:** Toast ou feedback inline (ícone + texto breve), 2–3s.
- **Progresso:** Barra de progresso (radius 999px) ou circular; cor semântica (verde/âmbar).

## Tokens de design

```text
// Cores
--color-primary: #6366F1;
--color-primary-hover: #4F46E5;
--color-success: #22C55E;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-bg: #F8FAFC;
--color-surface: #FFFFFF;
--color-text: #0F172A;
--color-text-muted: #64748B;
--color-border: #E2E8F0;

// Espaço (px) — escala de espaçamento
--space-1: 4;   --space-2: 8;   --space-3: 12;  --space-4: 16;
--space-5: 20;  --space-6: 24;  --space-8: 32;  --space-10: 40;  --space-16: 64;  --space-20: 80;

// Radius (px) — padrão de bordas
--radius-sm: 8;   --radius-md: 12;   --radius-lg: 16;   --radius-xl: 24;
--radius-full: 9999px;

// Padrão de sombras
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
--shadow-fab: 0 4px 12px rgba(99,102,241,0.4);

// Padrão de animações
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--easing-default: cubic-bezier(0.25, 0.1, 0.25, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
```

## Padrão de bordas

- Componentes (cards, inputs, botões): `--radius-md` ou `--radius-lg`.
- Badges e pills: `--radius-full`.
- Modais e sheets: `--radius-xl` no topo.

## Padrão de animações (resumo)

- **Entrada de tela:** fade ou slide 250ms, ease-out.
- **Interação (tap):** scale 0.98, 150ms.
- **Sheet:** translateY + overlay, 300ms, ease-out.
- **Gráficos e barras:** valor de 0 ao final em 400–500ms, ease-out.
- **Toast:** slide-in 250ms; exibição 3s; fade-out 200ms.

---

# 4️⃣ ESTRUTURA DAS TELAS

Para cada tela: **layout | hierarquia visual | componentes | microinterações | animações | fluxo de navegação | feedback visual**.

---

## 4.1 Home / Dashboard

| Aspecto | Descrição |
|---------|-----------|
| **Layout** | Header (saudação + avatar) → Card de saldo (número grande + “até dia 10”) → Resumo (receitas vs despesas, barra do mês) → Cards de metas (2–3) → Atividade recente (5 transações) → FAB. |
| **Hierarquia visual** | 1) Saldo (display); 2) Período e barra; 3) Metas; 4) Lista. |
| **Componentes** | BalanceCard, ProgressBar, MetricCard (metas), TransactionRow (lista), FAB, BottomNav. |
| **Microinterações** | Saldo com contagem opcional; progress bar animada; toque em transação → detalhe; toque em meta → detalhe. |
| **Animações** | Barra e cards com fade-in/stagger; lista com stagger leve. |
| **Fluxo de navegação** | Bottom nav; FAB → sheet Receita/Despesa; transação → detalhe; meta → detalhe. |
| **Feedback visual** | Toast ao voltar de “adicionar”; indicador de loading no pull-to-refresh. |

---

## 4.2 Transações (lista)

| Aspecto | Descrição |
|---------|-----------|
| **Layout** | Filtros (período, categoria, tipo) em chips → Lista agrupada por data (“Hoje”, “Ontem”, “11 mar”). |
| **Hierarquia visual** | Data como separador (caption); valor à direita (body bold); categoria e descrição à esquerda. |
| **Componentes** | Chips, lista com TransactionRow, FAB, optional search. |
| **Microinterações** | Swipe para editar/excluir; pull-to-refresh; toque → detalhe/edição. |
| **Animações** | Novo item no topo com slide-down; lista com stagger opcional. |
| **Fluxo de navegação** | FAB → nova transação; item → detalhe/edição. |
| **Feedback visual** | Toast ao excluir/editar; estado vazio com ilustração + CTA. |

---

## 4.3 Adicionar transação (Receita / Despesa)

| Aspecto | Descrição |
|---------|-----------|
| **Layout** | Sheet ou tela: toggle Receita/Despesa → Valor (input grande) → Categoria (grid/lista) → Data → Descrição (opcional) → “Salvar”. |
| **Hierarquia visual** | Valor em destaque; categoria em seguida; demais campos menores. |
| **Componentes** | Input monetário, CategorySelector, DatePicker, Button primary. |
| **Microinterações** | Teclado numérico; seleção de categoria com check/highlight; máscara R$ em tempo real. |
| **Animações** | Sheet abre com spring; ao salvar: check scale-in + toast; opcional confetti leve. |
| **Fluxo de navegação** | Salvar → fecha e volta à tela anterior; cancelar → fecha sheet. |
| **Feedback visual** | Validação inline (valor e categoria obrigatórios); toast “Registrado” ao sucesso. |

---

## 4.4 Metas

| Aspecto | Descrição |
|---------|-----------|
| **Layout** | Lista de cards: ícone, nome, atual vs alvo, barra de progresso, prazo; botão “Nova meta”. |
| **Hierarquia visual** | Nome da meta (h2); barra; números atual/alvo (body). |
| **Componentes** | Card de meta, ProgressBar, Button “Nova meta”. |
| **Microinterações** | Barra animada ao carregar; toque no card → detalhe e histórico. |
| **Animações** | Barras de 0 ao valor (400–500ms); cards com fade-in. |
| **Fluxo de navegação** | Card → detalhe da meta; “Nova meta” → fluxo de criação. |
| **Feedback visual** | Empty state com ilustração + “Criar primeira meta”; toast ao criar/editar. |

---

## 4.5 Relatórios / Gráficos

| Aspecto | Descrição |
|---------|-----------|
| **Layout** | Seletor de período → Gráfico (pizza ou barras) → Lista por categoria (valor e %) → opcional: linha de evolução. |
| **Hierarquia visual** | Gráfico como hero; lista para detalhe numérico. |
| **Componentes** | Segment control, PieChart/BarChart, lista, optional LineChart. |
| **Microinterações** | Toque em fatia/barra → highlight e tooltip; troca de período atualiza com animação. |
| **Animações** | Gráficos animando de 0 ao valor (400–600ms); transição suave ao mudar período. |
| **Fluxo de navegação** | Bottom nav; filtro de período inline. |
| **Feedback visual** | Loading com skeleton do gráfico; empty state se sem dados. |

---

## 4.6 Configuração / Perfil

| Aspecto | Descrição |
|---------|-----------|
| **Layout** | Avatar e nome → Grupos: Conta, Período, Categorias, Notificações, Sobre. |
| **Hierarquia visual** | Seções com título (h2); itens em lista com seta. |
| **Componentes** | Lista de configurações, Switch, navegação para subtelas. |
| **Microinterações** | Switch com animação; feedback ao salvar. |
| **Animações** | Transição padrão de tela. |
| **Fluxo de navegação** | Item → subtela (categorias, período, etc.). |
| **Feedback visual** | Toast “Preferências salvas” quando aplicável. |

---

## 4.7 Calendário (opcional)

| Aspecto | Descrição |
|---------|-----------|
| **Layout** | Calendário mensal com indicador por dia (valor ou cor) → ao tocar, lista do dia. |
| **Hierarquia visual** | Mês em destaque; dias com dot ou cor; lista abaixo ao selecionar. |
| **Componentes** | Calendário, lista de transações. |
| **Microinterações** | Navegação entre meses; toque no dia → lista. |
| **Animações** | Transição suave entre meses; highlight do dia selecionado. |
| **Fluxo de navegação** | Inline na tela; sem FAB. |
| **Feedback visual** | Legenda de cores (ex.: verde = dentro do limite). |

---

# 5️⃣ FLUXO DE NAVEGAÇÃO

- **Principal:** Bottom navigation (Home, Transações, Metas, Relatórios, Mais).
- **Home:** Ponto de partida; acesso rápido a saldo, metas e atividade.
- **Transações:** Lista e filtros; FAB para adicionar; toque para detalhe.
- **Adicionar:** Sempre acessível via FAB; pode ser sheet (rápido) ou tela cheia (mais campos).
- **Metas e Relatórios:** Telas de contexto; sem FAB ou FAB contextual (ex.: “Adicionar meta”).
- **Mais:** Config, ajuda, sobre; itens em lista.
- **Regra:** Nenhuma ação crítica a mais de 2 toques a partir do Home (ex.: Home → FAB → preencher valor e categoria → Salvar).

---

# 6️⃣ GAMIFICAÇÃO

Experiência **motivadora e positiva**, sem gerar ansiedade financeira.

| Elemento | Implementação |
|----------|----------------|
| **Barras de progresso para metas** | Cada meta com barra (atual / alvo); animação ao carregar; cor verde ao atingir. |
| **Conquistas financeiras** | Badges desbloqueáveis: “Primeiro mês no azul”, “3 meses economizando”, “Meta atingida”, “Sem estouro em Mercado”. |
| **Badges de hábitos** | “7 dias lançando em dia”, “Primeira meta”, “Organizou categorias”. |
| **Animações de recompensa** | Ao atingir meta: confetti leve ou badge com scale-in; ao salvar transação: check animado. |
| **Feedback visual ao economizar** | Toast “Você ficou X% abaixo do limite em [categoria]”; ícone positivo. |
| **Indicadores de progresso** | “Faltam R$ Y para sua meta”; “X% do orçamento usado”; “Dias até o fechamento: 5”. |
| **Desafios financeiros mensais** | Opcional: “Não estourar Mercado”, “Registrar todo dia”; card no Home com progresso. |

**Tom:** Sempre encorajador. Alertas em âmbar com sugestão de ação; evitar vermelho punitivo. Foco em “quanto falta” e “quanto você já fez”, não em culpa.

---

# 7️⃣ MOTION DESIGN E MICROINTERAÇÕES

Inspiração: Nubank, Revolut, Apple Wallet — **suave, rápido e elegante**.

| Elemento | Especificação |
|----------|----------------|
| **Animações entre telas** | Slide horizontal (stack) ou fade; 250–300ms; ease-out. |
| **Feedback ao adicionar transação** | Toast “Registrado” + ícone de check com scale-in; opcional confetti leve. |
| **Gráficos animados** | Barras e pizza de 0 ao valor em 400–600ms; ease-out. |
| **Microinterações em botões** | Scale 0.98 no tap; 150ms; opcional ripple. |
| **Loading states** | Skeleton com shimmer ou spinner centralizado; nunca tela branca parada. |
| **Transições suaves** | Bottom sheet: translateY + overlay opacity; lista: opcional stagger 30–50ms por item. |
| **Feedback de progresso financeiro** | Barras de meta e orçamento animando ao montar; cor de preenchimento com transição. |
| **Animações de conquista** | Badge ou modal com scale-in + opcional partículas; duração 1–2s. |

**Bottom sheet:** Abre com spring (0.3s ease-out); arraste para fechar com follow-through.  
**Princípio:** Animações curtas e com propósito; não bloquear ou atrasar tarefas críticas.

---

# 8️⃣ IDEIAS DE UX AVANÇADA

| Ideia | Implementação |
|-------|----------------|
| **Onboarding simples e animado** | 2–3 telas: (1) valor do app + ilustração, (2) “Defina seu dia de fechamento” (ex.: 10), (3) “Adicione sua primeira transação” com CTA. Copy curto; ilustrações da marca; botão “Pular” visível. |
| **Empty states motivadores** | Sempre ilustração + título + descrição + CTA. Ex.: “Nenhuma transação ainda” → “Registre gastos e receitas para ver tudo aqui” → “Adicionar transação”. Mesmo padrão para Metas e Relatórios. |
| **Notificações úteis** | Lembrete perto do dia 10 (“Fechamento em 2 dias”); alerta suave se categoria perto do limite (“Mercado em 80%”); opção de ativar/desativar em Config. |
| **Insights automáticos** | Card no Home ou seção “Insight”: “Você gastou menos em Lazer este mês”; “80% do orçamento usado”; “Meta Reserva a 70%”. Um por vez; tom positivo. |
| **Dicas financeiras** | Tooltip ou card ocasional: “Categorize para ver para onde vai o dinheiro”; “Metas ajudam a poupar”. Aparição esparsa; não intrusivo; dispensável. |
| **Visualização clara de progresso** | Home sempre com: saldo, barra do mês, próxima meta. Sensação de “estou no controle”; números e barras atualizados em tempo real. |

---

# 9️⃣ REFERÊNCIAS DE DESIGN

- **Nubank:** Roxo forte, cards simples, copy curto, onboarding objetivo.
- **Revolut:** Gráficos claros, categorias visuais, sensação de app “global”.
- **YNAB:** Envelope mental, orçamento por categoria, foco em “idade do dinheiro”.
- **Mint:** Dashboard único, resumo visual, cores por categoria.
- **Apple Wallet:** Cards empilhados, gestos, fluidez.
- **Monzo/Cleo:** Tom jovem, linguagem direta, feedback rápido.

Padrões aplicados: bottom nav estável, FAB para ação principal, cards com hierarquia clara, números grandes para saldo e metas, uso consistente de verde/âmbar/vermelho para semântica financeira.

---

# ETAPA FINAL — DESIGN PARA IMPLEMENTAÇÃO

Transformar o design em especificação pronta para desenvolvimento: estrutura, tokens, padrões e organização.

---

## Estrutura de componentes

```text
/components
  /ui           → Button, Input, Card, Badge, ProgressBar, Chip
  /layout       → Screen, BottomNav, FAB, BottomSheet, Modal
  /finance      → BalanceCard, TransactionRow, CategoryChip, MetricCard, CategorySelector
  /charts       → BarChart, PieChart, LineChart (encapsulados, animados)
  /feedback     → Toast, Skeleton, EmptyState, ErrorState
```

Cada componente: variantes por props (`variant`, `size`); estados (default, hover, active, disabled); acessibilidade (labels, foco, touch target ≥ 44px).

---

## Hierarquia visual

1. **Uma hero number por tela** — ex.: saldo na Home; valor total em Relatórios.
2. **Títulos:** h1 para título de tela; h2 para seções; body para conteúdo.
3. **Valores monetários:** `font-variant-numeric: tabular-nums`; alinhamento à direita em listas.
4. **CTA primário:** um por contexto (ex.: um “Salvar” por formulário; FAB como ação global onde fizer sentido).
5. **Agrupamento:** seções com espaço 24–32px; elementos relacionados com 8–12px.

---

## Spacing system

- **Base:** 4px.
- **Escala:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 (px).
- **Padding de tela:** 16–24px horizontal; 16–24px top/bottom.
- **Entre seções:** 24–32px vertical.
- **Dentro de cards:** 16–20px.

---

## Design tokens (referência única)

| Categoria | Tokens |
|-----------|--------|
| **Cores** | primary, primary-hover, success, warning, error; bg, surface, text, text-muted, border. (Ver [Identidade visual](#2-identidade-visual-completa).) |
| **Tipografia** | display (32–40px Bold), h1 (24–28px Bold), h2 (20–22px Semibold), body-lg (17px), body (15–16px), body-sm (13–14px), caption (11–12px). Tabular figures para números. |
| **Espaço** | space-1 a space-20 (4–80px). |
| **Radius** | sm 8, md 12, lg 16, xl 24, full 9999px. |
| **Sombras** | shadow-sm, shadow-md, shadow-lg, shadow-fab. |
| **Duração** | fast 150ms, normal 250ms, slow 400ms. |
| **Easing** | easing-default, easing-out (curves no código ou CSS). |

---

## Padrão de cores (implementação)

- Usar variáveis CSS ou tema (ex.: `--color-primary`); suportar tema claro e escuro.
- Semântica: success (verde), warning (âmbar), error (vermelho) apenas onde fizer sentido; evitar vermelho punitivo em alertas leves.

---

## Escala tipográfica (implementação)

- Fontes: Plus Jakarta Sans ou Inter; carregar apenas pesos 400, 500, 600, 700.
- Line-height: 1.25 (títulos), 1.4–1.5 (corpo).
- Letter-spacing: default; opcional -0.02em em display.

---

## Padrão de animações (implementação)

| Contexto | Duração | Efeito |
|----------|---------|--------|
| Transição de tela | 250–300ms | fade ou slide horizontal; ease-out |
| Bottom sheet | 300ms | translateY + overlay opacity; ease-out |
| Botão (tap) | 150ms | scale(0.98) |
| Lista (entrada) | opcional | stagger 30–50ms por item |
| Gráficos/barras | 400–500ms | valor 0 → final; ease-out |
| Toast | 250ms in, 3s show, 200ms out | slide-in; fade-out |
| Conquista/sucesso | 1–2s | scale-in + opcional partículas |

---

## Organização de componentes

- **Pasta por componente:** `ComponentName.tsx`, estilos (module.css ou styled), `index.ts` (export).
- **Props:** variantes explícitas (ex.: `variant="primary"`, `size="md"`); documentar em Storybook ou página de design.
- **Tokens:** centralizar em um arquivo de tema (tokens.css ou theme.ts) e importar nos componentes.
- **Acessibilidade:** aria-labels onde necessário; contraste mínimo; touch targets ≥ 44px.

---

*Documento de referência para o app de controle financeiro. Ajuste nome da marca (ex.: Pulse), cores e copy ao gosto da marca final.*
