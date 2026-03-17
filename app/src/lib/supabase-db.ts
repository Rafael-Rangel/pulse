import { supabase } from "./supabase";
import type { ConfigMes, ConfigCategoria, Lancamento, SuggestedAction } from "./types";

export interface ChatMessageRow {
  role: "user" | "assistant";
  content: string;
  suggestedActions?: SuggestedAction[] | null;
}

const PERCENTUAIS_INICIAIS: Record<string, number> = {
  Moradia: 0,
  Contas: 15,
  Mercado: 20,
  Transporte: 8,
  Saúde: 5,
  Lazer: 10,
  Educação: 25,
  Dívidas: 5,
  Reserva: 10,
  Outros: 2,
};

export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getDataInicioFim(ano: number, mes: number): { data_inicio: string; data_fim: string } {
  const dataInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const lastDay = new Date(ano, mes, 0);
  const dataFim = lastDay.toISOString().slice(0, 10);
  return { data_inicio: dataInicio, data_fim: dataFim };
}

/** Período do calendário: de hoje até o próximo dia 10 (salário). */
export function getPeriodoAteProximoDia10(): { data_inicio: string; data_fim: string } {
  const now = new Date();
  const dataInicio = now.toISOString().slice(0, 10);
  let next10: Date;
  if (now.getDate() < 10) {
    next10 = new Date(now.getFullYear(), now.getMonth(), 10);
  } else {
    next10 = new Date(now.getFullYear(), now.getMonth() + 1, 10);
  }
  const dataFim = next10.toISOString().slice(0, 10);
  return { data_inicio: dataInicio, data_fim: dataFim };
}

/** Retorna mes_id; se o mês não existir, cria com valores padrão e planejamentos iniciais. */
async function getOrCreateMesId(ano: number, mes: number): Promise<number | null> {
  if (!supabase) return null;
  const now = new Date();
  const isCurrentMonth = ano === now.getFullYear() && mes === now.getMonth() + 1;
  const { data_inicio, data_fim } = isCurrentMonth ? getPeriodoAteProximoDia10() : getDataInicioFim(ano, mes);

  const { data: existing } = await supabase
    .from("meses")
    .select("id")
    .eq("ano", ano)
    .eq("mes", mes)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: inserted, error: errMes } = await supabase
    .from("meses")
    .insert({
      ano,
      mes,
      renda_base: 0,
      renda_extra: 0,
      saldo_inicial: 0,
      gasto_antecipado_extra: 0,
      data_inicio,
      data_fim,
    })
    .select("id")
    .single();

  if (errMes || !inserted?.id) return null;

  const { data: categorias } = await supabase.from("categorias").select("id, nome");
  if (!categorias?.length) return inserted.id;

  const planejamentos = categorias.map((c) => {
    const pct = (PERCENTUAIS_INICIAIS[c.nome] ?? 0) / 100;
    return {
      mes_id: inserted.id,
      categoria_id: c.id,
      percentual_planejado: pct,
      valor_planejado: 0,
      ajuste_valor: 0,
      ajuste_percentual: 0,
    };
  });
  await supabase.from("planejamentos").insert(planejamentos);

  return inserted.id;
}

export async function getConfig(ano: number, mes: number): Promise<ConfigMes | null> {
  if (!supabase) return null;

  const mesId = await getOrCreateMesId(ano, mes);
  if (mesId == null) return null;

  const { data: mesRow, error: errMes } = await supabase
    .from("meses")
    .select("*")
    .eq("id", mesId)
    .single();
  if (errMes || !mesRow) return null;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const isCurrentMonth = mesRow.ano === now.getFullYear() && mesRow.mes === now.getMonth() + 1;
  const dataFimStored = String(mesRow.data_fim).slice(0, 10);
  const dataInicioStored = String(mesRow.data_inicio).slice(0, 10);
  const firstDayOfMonth = `${mesRow.ano}-${String(mesRow.mes).padStart(2, "0")}-01`;
  const periodo = isCurrentMonth ? getPeriodoAteProximoDia10() : null;

  if (isCurrentMonth && periodo) {
    const periodEnded = dataFimStored < today;
    const stillOldFullMonth = dataInicioStored === firstDayOfMonth;
    if (periodEnded || stillOldFullMonth) {
      await supabase
        .from("meses")
        .update({ data_inicio: periodo.data_inicio, data_fim: periodo.data_fim })
        .eq("id", mesId);
      (mesRow as { data_inicio: string; data_fim: string }).data_inicio = periodo.data_inicio;
      (mesRow as { data_inicio: string; data_fim: string }).data_fim = periodo.data_fim;
    } else if (dataInicioStored > today) {
      (mesRow as { data_inicio: string }).data_inicio = today;
      await supabase.from("meses").update({ data_inicio: today }).eq("id", mesId);
    }
  }

  const totalDisponivel =
    Number(mesRow.renda_base) +
    Number(mesRow.renda_extra) +
    Number(mesRow.saldo_inicial) -
    Number(mesRow.gasto_antecipado_extra);

  const { data: planRows, error: errPlan } = await supabase
    .from("planejamentos")
    .select("*, categorias(nome, tipo, ativo)")
    .eq("mes_id", mesId);
  if (errPlan) return null;

  const planRowsFiltered = (planRows ?? []).filter(
    (p: { categorias: { ativo?: boolean } | null }) => (p.categorias as { ativo?: boolean } | null)?.ativo !== false
  );

  const categorias: ConfigCategoria[] = planRowsFiltered.map((p: { categorias: { nome: string; tipo: string } | null; percentual_planejado: number; valor_planejado: number; ajuste_valor: number }) => {
    const nome = (p.categorias as { nome: string; tipo: string } | null)?.nome ?? "";
    const tipo = (p.categorias as { nome: string; tipo: string } | null)?.tipo === "Variável" ? "Variável" : "Fixo";
    const percentual = Number(p.percentual_planejado);
    const valorPlanejado = totalDisponivel * percentual;
    const ajuste = Number(p.ajuste_valor);
    return {
      nome,
      tipo: tipo as "Fixo" | "Variável",
      percentual,
      valorPlanejado,
      limiteDiarioSugerido: valorPlanejado / 30,
      ajusteManual: ajuste,
      valorPlanejadoAjustado: valorPlanejado + ajuste,
    };
  });

  return {
    ano: mesRow.ano,
    mes: mesRow.mes,
    rendaBase: Number(mesRow.renda_base),
    rendaExtra: Number(mesRow.renda_extra),
    saldoInicial: Number(mesRow.saldo_inicial),
    gastoAntecipadoExtra: Number(mesRow.gasto_antecipado_extra),
    dataInicio: String(mesRow.data_inicio).slice(0, 10),
    dataFim: String(mesRow.data_fim).slice(0, 10),
    totalDisponivel,
    categorias,
  };
}

export async function setConfig(config: Partial<ConfigMes>): Promise<boolean> {
  if (!supabase || !config.ano || !config.mes) return false;

  const now = new Date();
  const isCurrentMonth = config.ano === now.getFullYear() && config.mes === now.getMonth() + 1;
  const { data_inicio, data_fim } =
    config.dataInicio && config.dataFim
      ? { data_inicio: config.dataInicio, data_fim: config.dataFim }
      : isCurrentMonth
        ? getPeriodoAteProximoDia10()
        : getDataInicioFim(config.ano, config.mes);

  const mesId = await getOrCreateMesId(config.ano, config.mes);
  if (mesId == null) return false;

  const { error: errMes } = await supabase
    .from("meses")
    .update({
      renda_base: config.rendaBase ?? 0,
      renda_extra: config.rendaExtra ?? 0,
      saldo_inicial: config.saldoInicial ?? 0,
      gasto_antecipado_extra: config.gastoAntecipadoExtra ?? 0,
      data_inicio,
      data_fim,
    })
    .eq("id", mesId);
  if (errMes) return false;

  if (!config.categorias?.length) return true;

  const { data: cats } = await supabase.from("categorias").select("id, nome");
  const byNome = new Map((cats ?? []).map((c) => [c.nome, c.id]));

  for (const c of config.categorias) {
    const categoriaId = byNome.get(c.nome);
    if (categoriaId == null) continue;
    const total =
      (config.rendaBase ?? 0) +
      (config.rendaExtra ?? 0) +
      (config.saldoInicial ?? 0) -
      (config.gastoAntecipadoExtra ?? 0);
    const valorPlanejado = total * (c.percentual ?? 0);
    await supabase
      .from("planejamentos")
      .upsert(
        {
          mes_id: mesId,
          categoria_id: categoriaId,
          percentual_planejado: c.percentual ?? 0,
          valor_planejado: valorPlanejado,
          ajuste_valor: c.ajusteManual ?? 0,
          ajuste_percentual: 0,
        },
        { onConflict: "mes_id,categoria_id" }
      );
  }
  return true;
}

export async function getLancamentos(ano: number, mes: number): Promise<Lancamento[]> {
  if (!supabase) return [];

  const mesId = await getOrCreateMesId(ano, mes);
  if (mesId == null) return [];

  const { data: rows, error } = await supabase
    .from("lancamentos")
    .select("id, data, descricao, categoria_id, subcategoria, tipo, valor, meio_pagamento, observacoes, categorias(nome)")
    .eq("mes_id", mesId)
    .order("data", { ascending: true });

  if (error) return [];

  return (rows ?? []).map((r: Record<string, unknown>) => {
    const cat = r.categorias as { nome: string } | { nome: string }[] | null;
    const nome = Array.isArray(cat) ? cat[0]?.nome : cat?.nome;
    return {
      id: String(r.id),
      data: String(r.data).slice(0, 10),
      descricao: String(r.descricao ?? ""),
      categoria: nome ?? "",
      subcategoria: (r.subcategoria as string | null) ?? undefined,
      tipo: (r.tipo === "Extra" || r.tipo === "Variável" ? r.tipo : "Fixo") as Lancamento["tipo"],
      valor: Number(r.valor),
      meioPagamento: (r.meio_pagamento as string | null) ?? undefined,
      observacoes: (r.observacoes as string | null) ?? undefined,
    };
  });
}

export async function appendLancamento(
  lanc: Lancamento,
  ano: number,
  mes: number
): Promise<boolean> {
  if (!supabase) return false;

  const mesId = await getOrCreateMesId(ano, mes);
  if (mesId == null) return false;

  const { data: cat } = await supabase
    .from("categorias")
    .select("id")
    .eq("nome", lanc.categoria)
    .maybeSingle();
  if (!cat?.id) return false;

  const { error } = await supabase.from("lancamentos").insert({
    mes_id: mesId,
    data: lanc.data,
    descricao: lanc.descricao,
    categoria_id: cat.id,
    subcategoria: lanc.subcategoria ?? null,
    tipo: lanc.tipo,
    valor: lanc.valor,
    meio_pagamento: lanc.meioPagamento ?? null,
    observacoes: lanc.observacoes ?? null,
    usa_renda_extra: lanc.tipo === "Extra",
  });
  return !error;
}

export async function updateLancamento(
  id: number,
  lanc: Lancamento
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Supabase não configurado" };

  const { data: cat } = await supabase
    .from("categorias")
    .select("id")
    .eq("nome", lanc.categoria)
    .maybeSingle();
  if (!cat?.id) return { ok: false, error: "Categoria inválida" };

  const { error } = await supabase
    .from("lancamentos")
    .update({
      data: lanc.data,
      descricao: lanc.descricao,
      categoria_id: cat.id,
      subcategoria: lanc.subcategoria ?? null,
      tipo: lanc.tipo,
      valor: lanc.valor,
      meio_pagamento: lanc.meioPagamento ?? null,
      observacoes: lanc.observacoes ?? null,
      usa_renda_extra: lanc.tipo === "Extra",
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message ?? "Erro ao atualizar" };
  return { ok: true };
}

export async function deleteLancamento(id: number): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Supabase não configurado" };
  const { error } = await supabase.from("lancamentos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message ?? "Erro ao excluir" };
  return { ok: true };
}

/** Garante que o mês atual existe no banco (seed). */
export async function seedMesAtual(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Supabase não configurado" };
  const now = new Date();
  const mesId = await getOrCreateMesId(now.getFullYear(), now.getMonth() + 1);
  if (mesId == null) return { ok: false, error: "Falha ao criar/buscar mês" };
  return { ok: true };
}

// --- Categorias (CRUD) ---

export interface CategoriaRow {
  id: number;
  nome: string;
  tipo: "Fixo" | "Variável";
  ativo: boolean;
}

export async function listCategorias(apenasAtivas = true): Promise<CategoriaRow[]> {
  if (!supabase) return [];
  let q = supabase.from("categorias").select("id, nome, tipo, ativo").order("nome");
  if (apenasAtivas) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []).map((r: { id: number; nome: string; tipo: string; ativo: boolean }) => ({
    id: r.id,
    nome: r.nome,
    tipo: r.tipo === "Variável" ? "Variável" : "Fixo",
    ativo: r.ativo,
  }));
}

export async function createCategoria(nome: string, tipo: "Fixo" | "Variável"): Promise<{ id?: number; error?: string }> {
  if (!supabase) return { error: "Supabase não configurado" };
  const nomeTrim = nome.trim();
  if (!nomeTrim) return { error: "Nome obrigatório" };
  const { data: inserted, error: errInsert } = await supabase
    .from("categorias")
    .insert({ nome: nomeTrim, tipo })
    .select("id")
    .single();
  if (errInsert) return { error: errInsert.message ?? "Erro ao criar categoria" };
  if (!inserted?.id) return { error: "Erro ao criar categoria" };

  const { data: meses } = await supabase.from("meses").select("id");
  if (meses?.length) {
    const planejamentos = meses.map((m: { id: number }) => ({
      mes_id: m.id,
      categoria_id: inserted.id,
      percentual_planejado: 0,
      valor_planejado: 0,
      ajuste_valor: 0,
      ajuste_percentual: 0,
    }));
    await supabase.from("planejamentos").insert(planejamentos);
  }
  return { id: inserted.id };
}

export async function updateCategoria(id: number, patch: { nome?: string; tipo?: "Fixo" | "Variável" }): Promise<{ error?: string }> {
  if (!supabase) return { error: "Supabase não configurado" };
  const body: { nome?: string; tipo?: string } = {};
  if (patch.nome !== undefined) body.nome = patch.nome.trim();
  if (patch.tipo !== undefined) body.tipo = patch.tipo;
  if (Object.keys(body).length === 0) return {};
  const { error } = await supabase.from("categorias").update(body).eq("id", id);
  return error ? { error: error.message } : {};
}

export async function deleteCategoria(id: number): Promise<{ error?: string }> {
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase.from("categorias").update({ ativo: false }).eq("id", id);
  return error ? { error: error.message } : {};
}

// --- Chat (histórico da IA) ---

/** Retorna o id da conversa mais recente, ou cria uma nova. */
export async function getOrCreateChatConversa(): Promise<number | null> {
  if (!supabase) return null;
  const { data: latest } = await supabase
    .from("chat_conversas")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest?.id) return latest.id;
  const { data: inserted, error } = await supabase
    .from("chat_conversas")
    .insert({})
    .select("id")
    .single();
  if (error || !inserted?.id) return null;
  return inserted.id;
}

/** Lista mensagens de uma conversa, em ordem. */
export async function getChatMensagens(conversaId: number): Promise<ChatMessageRow[]> {
  if (!supabase) return [];
  const { data: rows, error } = await supabase
    .from("chat_mensagens")
    .select("role, content, suggested_actions")
    .eq("conversa_id", conversaId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (rows ?? []).map((r: { role: string; content: string; suggested_actions: unknown }) => ({
    role: r.role as "user" | "assistant",
    content: r.content,
    suggestedActions: Array.isArray(r.suggested_actions) ? (r.suggested_actions as SuggestedAction[]) : undefined,
  }));
}

/** Insere uma mensagem e atualiza updated_at da conversa. */
export async function appendChatMensagem(
  conversaId: number,
  role: "user" | "assistant",
  content: string,
  suggestedActions?: SuggestedAction[] | null
): Promise<boolean> {
  if (!supabase) return false;
  const { error: errMsg } = await supabase.from("chat_mensagens").insert({
    conversa_id: conversaId,
    role,
    content,
    suggested_actions: suggestedActions ?? null,
  });
  if (errMsg) return false;
  await supabase
    .from("chat_conversas")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversaId);
  return true;
}
