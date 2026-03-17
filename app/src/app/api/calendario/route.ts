import { NextResponse } from "next/server";
import { getConfig, getLancamentos, hasSupabaseConfig } from "@/lib/supabase-db";
import { mockConfig } from "@/lib/mock";
import { mockLancamentos } from "@/lib/mock";
import type { DiaCalendario } from "@/lib/types";

function getAnoMes(request: Request): { ano: number; mes: number } {
  const url = new URL(request.url);
  const now = new Date();
  const ano = parseInt(url.searchParams.get("ano") ?? "", 10) || now.getFullYear();
  const mes = parseInt(url.searchParams.get("mes") ?? "", 10) || now.getMonth() + 1;
  return { ano, mes };
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

export async function GET(request: Request) {
  const { ano, mes } = getAnoMes(request);
  const config = hasSupabaseConfig()
    ? await getConfig(ano, mes)
    : mockConfig;
  const lancamentos = hasSupabaseConfig()
    ? await getLancamentos(ano, mes)
    : mockLancamentos;
  if (!config) {
    return NextResponse.json({ dias: [] });
  }
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
  const resultado: DiaCalendario[] = dias.map((data) => {
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
  return NextResponse.json({ dias: resultado });
}
