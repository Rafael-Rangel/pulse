import { NextResponse } from "next/server";
import { getConfig, getLancamentos, hasSupabaseConfig } from "@/lib/supabase-db";
import { mockConfig } from "@/lib/mock";
import { mockLancamentos } from "@/lib/mock";
import type { ResumoMensal } from "@/lib/types";

function getAnoMes(request: Request): { ano: number; mes: number } {
  const url = new URL(request.url);
  const now = new Date();
  const ano = parseInt(url.searchParams.get("ano") ?? "", 10) || now.getFullYear();
  const mes = parseInt(url.searchParams.get("mes") ?? "", 10) || now.getMonth() + 1;
  return { ano, mes };
}

export async function GET(request: Request) {
  const { ano, mes } = getAnoMes(request);
  const config = hasSupabaseConfig()
    ? await getConfig(ano, mes)
    : mockConfig;
  const lancamentos = hasSupabaseConfig()
    ? await getLancamentos(ano, mes)
    : mockLancamentos;
  if (!config) {
    return NextResponse.json({
      totalDisponivel: 0,
      totalGasto: 0,
      saldoFinal: 0,
      percentualUsado: 0,
      porCategoria: [],
    } as ResumoMensal);
  }
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
  const resumo: ResumoMensal = {
    totalDisponivel,
    totalGasto,
    saldoFinal,
    percentualUsado,
    porCategoria,
  };
  return NextResponse.json(resumo);
}
