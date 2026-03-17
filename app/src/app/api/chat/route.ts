import { NextResponse } from "next/server";
import { getConfig, getLancamentos, hasSupabaseConfig, getOrCreateChatConversa, getChatMensagens, appendChatMensagem } from "@/lib/supabase-db";
import { mockConfig } from "@/lib/mock";
import { mockLancamentos } from "@/lib/mock";
import type { ConfigMes, Lancamento, ResumoMensal, DiaCalendario, SuggestedAction, UpdateConfigAction } from "@/lib/types";

function getAnoMes(): { ano: number; mes: number } {
  const now = new Date();
  return { ano: now.getFullYear(), mes: now.getMonth() + 1 };
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDiasEntre(inicio: string, fim: string): string[] {
  const out: string[] = [];
  const d = new Date(inicio);
  const end = new Date(fim);
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function buildResumo(
  config: ConfigMes,
  lancamentos: Lancamento[]
): ResumoMensal {
  const totalDisponivel = config.totalDisponivel;
  const totalGasto = lancamentos.reduce((s, l) => s + l.valor, 0);
  const saldoFinal = totalDisponivel - totalGasto;
  const percentualUsado = totalDisponivel > 0 ? totalGasto / totalDisponivel : 0;
  const gastoPorCat: Record<string, number> = {};
  for (const l of lancamentos) {
    gastoPorCat[l.categoria] = (gastoPorCat[l.categoria] ?? 0) + l.valor;
  }
  const porCategoria = config.categorias.map((c) => {
    const gasto = gastoPorCat[c.nome] ?? 0;
    const planejado = c.valorPlanejadoAjustado;
    return {
      categoria: c.nome,
      planejado,
      gasto,
      diferenca: planejado - gasto,
      percentualUsado: planejado > 0 ? gasto / planejado : 0,
    };
  });
  return {
    totalDisponivel,
    totalGasto,
    saldoFinal,
    percentualUsado,
    porCategoria,
  };
}

function buildCalendario(
  config: ConfigMes,
  lancamentos: Lancamento[]
): DiaCalendario[] {
  const { dataInicio, dataFim, totalDisponivel } = config;
  const dias = getDiasEntre(dataInicio, dataFim);
  const nDias = dias.length;
  const limiteDiario = nDias > 0 ? totalDisponivel / nDias : 0;
  const gastoPorData: Record<string, number> = {};
  for (const l of lancamentos) {
    if (l.data >= dataInicio && l.data <= dataFim) {
      gastoPorData[l.data] = (gastoPorData[l.data] ?? 0) + l.valor;
    }
  }
  let saldo = totalDisponivel;
  return dias.map((data) => {
    const gastoDia = gastoPorData[data] ?? 0;
    const saldoInicial = saldo;
    saldo -= gastoDia;
    const d = new Date(data + "T12:00:00");
    return {
      data,
      diaSemana: DIAS_SEMANA[d.getDay()],
      saldoInicial,
      limiteDiario,
      gastoDia,
      saldoFinal: saldo,
    };
  });
}

function buildContext(
  config: ConfigMes | null,
  lancamentos: Lancamento[]
): string {
  if (!config) return "Não há dados do mês configurados.";

  const resumo = buildResumo(config, lancamentos);
  const calendario = buildCalendario(config, lancamentos);

  const totalDisp = config.totalDisponivel;
  const categoriasResumo = config.categorias.map((c) => {
    const r = resumo.porCategoria.find((p) => p.categoria === c.nome);
    const gasto = r?.gasto ?? 0;
    const planejado = c.valorPlanejadoAjustado;
    const pctNum = (c.percentual * 100).toFixed(1);
    const valorFixo = c.ajusteManual ?? 0;
    const pctGasto = planejado > 0 ? ((gasto / planejado) * 100).toFixed(0) : "0";
    return `${c.nome}: % do total = ${pctNum}%, Valor fixo (R$) = ${valorFixo.toFixed(2)} → Planejado = R$ ${planejado.toFixed(2)} | Gasto R$ ${gasto.toFixed(2)} (${pctGasto}% do planejado)`;
  });
  const regraCategorias = "Regra: Planejado = (Total disponível × %/100) + Valor fixo (R$). Cada categoria pode ser definida só por %, só por valor fixo em R$, ou pelos dois (soma). A soma de todos os planejados deve ser igual ao total disponível.";

  const limiteDiario = calendario[0]?.limiteDiario ?? 0;
  const calendarioResumo =
    calendario.length > 0
      ? calendario
          .slice(0, 7)
          .map(
            (d) =>
              `${d.data} ${d.diaSemana}: limite R$ ${d.limiteDiario.toFixed(0)}, gasto R$ ${d.gastoDia.toFixed(0)}, saldo final R$ ${d.saldoFinal.toFixed(0)}`
          )
          .join("\n") +
        (calendario.length > 7 ? `\n... e mais ${calendario.length - 7} dias.` : "")
      : "Nenhum dia no período.";

  return [
    "=== MÊS E CONFIGURAÇÃO ===",
    `Mês atual: ${config.mes}/${config.ano}. Período: ${config.dataInicio} a ${config.dataFim}.`,
    `Renda base R$ ${config.rendaBase.toFixed(2)}, renda extra R$ ${config.rendaExtra.toFixed(2)}, saldo inicial R$ ${config.saldoInicial.toFixed(2)}, gasto antecipado da renda extra R$ ${config.gastoAntecipadoExtra.toFixed(2)}.`,
    `Total disponível no mês: R$ ${config.totalDisponivel.toFixed(2)}.`,
    "",
    "=== CATEGORIAS (tetos e gastos) ===",
    regraCategorias,
    ...categoriasResumo,
    `Total disponível: R$ ${totalDisp.toFixed(2)}. Soma dos planejados deve bater com esse valor.`,
    "",
    "=== RESUMO DO MÊS ===",
    `Total gasto: R$ ${resumo.totalGasto.toFixed(2)}. Saldo restante: R$ ${resumo.saldoFinal.toFixed(2)}.`,
    `Percentual do orçamento já usado: ${(resumo.percentualUsado * 100).toFixed(1)}%.`,
    "Por categoria (planejado vs gasto):",
    ...resumo.porCategoria.map(
      (p) =>
        `  ${p.categoria}: R$ ${p.gasto.toFixed(2)} / R$ ${p.planejado.toFixed(2)} (sobra R$ ${p.diferenca.toFixed(2)})`
    ),
    "",
    "=== CALENDÁRIO (limite diário e gastos por dia) ===",
    `Limite diário sugerido: R$ ${limiteDiario.toFixed(2)}.`,
    "Primeiros dias:",
    calendarioResumo,
    "",
    "=== LANÇAMENTOS (lista de gastos registrados) ===",
    lancamentos.length
      ? lancamentos
          .map(
            (l) =>
              `${l.data} - ${l.descricao} (${l.categoria}) R$ ${l.valor.toFixed(2)}${l.tipo ? ` [${l.tipo}]` : ""}`
          )
          .join("\n")
      : "Nenhum lançamento ainda.",
    "",
    "=== GRÁFICOS (o que o app mostra) ===",
    "O app tem gráfico de linha com evolução do saldo dia a dia, gráfico de barras (limite diário vs gasto por dia) e gráfico de pizza com gastos por categoria.",
  ].join("\n");
}

function parseActionsFromResponse(content: string): { text: string; actions: SuggestedAction[] } {
  const match = content.match(/\[ACTIONS\]([\s\S]*?)\[\/ACTIONS\]/);
  let text = content;
  const actions: SuggestedAction[] = [];
  if (match) {
    text = content.replace(match[0], "").trim();
    try {
      const parsed = JSON.parse(match[1].trim()) as { actions?: unknown[] };
      if (Array.isArray(parsed.actions)) {
        for (const a of parsed.actions) {
          if (a && typeof a === "object" && "type" in a && "payload" in a) {
            if (a.type === "add_lancamento" && a.payload && typeof a.payload === "object") {
              const p = a.payload as Record<string, unknown>;
              if (typeof p.data === "string" && typeof p.descricao === "string" && typeof p.categoria === "string" && typeof p.valor === "number") {
                actions.push({
                  type: "add_lancamento",
                  payload: {
                    data: p.data,
                    descricao: p.descricao,
                    categoria: p.categoria,
                    valor: p.valor,
                    tipo: p.tipo === "Fixo" || p.tipo === "Variável" || p.tipo === "Extra" ? p.tipo : "Variável",
                  },
                });
              }
            }
            if (a.type === "update_config" && a.payload && typeof a.payload === "object") {
              actions.push({ type: "update_config", payload: a.payload as UpdateConfigAction["payload"] });
            }
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }
  return { text, actions };
}

/** GET: carrega histórico do chat (Supabase). Sem Supabase retorna lista vazia. */
export async function GET(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ conversaId: null, messages: [] });
  }
  const url = new URL(request.url);
  let conversaId = parseInt(url.searchParams.get("conversa_id") ?? "", 10);
  if (!conversaId || Number.isNaN(conversaId)) {
    const id = await getOrCreateChatConversa();
    if (id == null) return NextResponse.json({ conversaId: null, messages: [] });
    conversaId = id;
  }
  const messages = await getChatMensagens(conversaId);
  return NextResponse.json({ conversaId, messages });
}

export async function POST(request: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "GROQ_API_KEY não configurada." },
      { status: 503 }
    );
  }

  let body: { messages?: { role: string; content: string }[]; conversa_id?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Envie pelo menos uma mensagem." }, { status: 400 });
  }

  let conversaId: number | null = null;
  if (hasSupabaseConfig()) {
    conversaId = body.conversa_id && Number.isInteger(body.conversa_id) ? body.conversa_id : await getOrCreateChatConversa();
  }

  const { ano, mes } = getAnoMes();
  const config = hasSupabaseConfig() ? await getConfig(ano, mes) : mockConfig;
  const lancamentos = hasSupabaseConfig() ? await getLancamentos(ano, mes) : mockLancamentos;
  const context = buildContext(config, lancamentos);

  const systemContent = [
    "Você é o assistente do app de planejamento financeiro mensal. O usuário pode falar sobre TUDO no app: configuração do mês (renda, tetos, categorias, ajustes), lançamentos (gastos), resumo (totais, saldo, percentual usado), calendário (limite diário, gasto por dia) e gráficos (evolução do saldo, pizza por categoria). Responda sempre em português, de forma clara e objetiva.",
    "Além de responder e explicar, você pode EXECUTAR alterações quando o usuário pedir: registrar um gasto (lançamento), alterar renda, alterar teto de categoria (por % ou por valor em R$), etc.",
    "CATEGORIAS: Cada categoria tem percentual (0 a 1 no JSON: 0.20 = 20%) e valor fixo em R$ (ajusteManual). Planejado = (Total disponível × percentual) + ajusteManual. Ao alterar %, use ajusteManual 0 em todas e envie a lista COMPLETA de categorias com os novos percentuais. OBRIGATÓRIO: a soma de todos os percentuais deve dar exatamente 1.0 (100%). Nunca ultrapasse 100%.",
    "Quando o usuário pedir 'melhorar as %', 'ajustar percentuais' ou algo vago: responda DIRETO, dê uma sugestão concreta imediatamente (ex: distribuição equilibrada ou priorizando reserva/investimento) e inclua a ação. Seja breve: evite explicações longas e cálculos passo a passo. Vá direto ao ponto: lista final de % por categoria e o bloco [ACTIONS].",
    "Quando priorizar categorias (ex: reserva, investimento, lazer): aumente as % dessas e reduza as outras, garantindo que a soma = 100%. Inclua TODAS as categorias do contexto no array categorias, cada uma com nome e percentual (ajusteManual 0). Faça exatamente o que o usuário pediu, sem inventar.",
    "Quando o usuário pedir para adicionar um gasto/lançamento ou alterar alguma configuração, inclua na sua resposta um bloco com as ações no formato exato abaixo (uma única linha, sem quebra dentro do JSON):",
    "[ACTIONS]{\"actions\":[{\"type\":\"add_lancamento\",\"payload\":{\"data\":\"YYYY-MM-DD\",\"descricao\":\"texto\",\"categoria\":\"Nome da categoria\",\"valor\":número,\"tipo\":\"Variável\"}}]}[/ACTIONS]",
    "ou para config: [ACTIONS]{\"actions\":[{\"type\":\"update_config\",\"payload\":{\"rendaBase\":5000}}]}[/ACTIONS] ou com categorias: {\"categorias\":[{\"nome\":\"Mercado\",\"percentual\":0.2,\"ajusteManual\":0}]} ou {\"categorias\":[{\"nome\":\"Comida\",\"percentual\":0,\"ajusteManual\":500}]}.",
    "Regras: add_lancamento usa valor positivo para gasto; data em YYYY-MM-DD; categoria deve ser um dos nomes do contexto; tipo opcional (Fixo, Variável ou Extra). update_config: categorias é array de objetos com nome (obrigatório) e percentual (0 a 1) e/ou ajusteManual (R$). Use percentual em decimal (0.15 = 15%). Use apenas nomes de categorias que existem no contexto.",
    "Contexto atual do app:",
    "---",
    context,
    "---",
  ].join("\n");

  const groqMessages = [
    { role: "system" as const, content: systemContent },
    ...messages.map((m) => ({
      role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: groqMessages,
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message ?? "Erro na API Groq." },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const rawContent = data?.choices?.[0]?.message?.content?.trim() ?? "";
    const { text: content, actions } = parseActionsFromResponse(rawContent);

    if (conversaId != null) {
      const lastUser = messages.filter((m) => m.role === "user").pop();
      if (lastUser?.content) {
        await appendChatMensagem(conversaId, "user", lastUser.content, null);
      }
      await appendChatMensagem(conversaId, "assistant", content, actions.length > 0 ? actions : null);
    }

    return NextResponse.json({
      content,
      suggestedActions: actions.length > 0 ? actions : undefined,
      ano,
      mes,
      conversaId: conversaId ?? undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao chamar a IA.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
