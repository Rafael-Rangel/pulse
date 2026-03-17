import { NextResponse } from "next/server";
import { getConfig, getLancamentos, hasSupabaseConfig } from "@/lib/supabase-db";
import { mockConfig } from "@/lib/mock";
import { mockLancamentos } from "@/lib/mock";
import type { DiaCalendario } from "@/lib/types";

/** Próximo dia 10 a partir de uma data YYYY-MM-DD (pode ser mesmo mês ou mês seguinte). */
function proximoDia10(aPartirDe: string): string {
  const [y, m, d] = aPartirDe.split("-").map(Number);
  if (d < 10) return `${y}-${String(m).padStart(2, "0")}-10`;
  if (m === 12) return `${y + 1}-01-10`;
  return `${y}-${String(m + 1).padStart(2, "0")}-10`;
}

function getAnoMes(request: Request): { ano: number; mes: number; hoje?: string } {
  const url = new URL(request.url);
  const hojeParam = url.searchParams.get("hoje"); // data local do dispositivo (YYYY-MM-DD)
  if (hojeParam && /^\d{4}-\d{2}-\d{2}$/.test(hojeParam)) {
    const [ano, mes] = hojeParam.split("-").map(Number);
    return { ano, mes, hoje: hojeParam };
  }
  const now = new Date();
  const ano = parseInt(url.searchParams.get("ano") ?? "", 10) || now.getFullYear();
  const mes = parseInt(url.searchParams.get("mes") ?? "", 10) || now.getMonth() + 1;
  return { ano, mes };
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDiasEntre(inicio: string, fim: string): string[] {
  const out: string[] = [];
  const [y0, m0, d0] = inicio.split("-").map(Number);
  const [y1, m1, d1] = fim.split("-").map(Number);
  let y = y0, m = m0, d = d0;
  while (y < y1 || (y === y1 && m < m1) || (y === y1 && m === m1 && d <= d1)) {
    out.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    if (y === y1 && m === m1 && d === d1) break;
    d += 1;
    const ultimoDia = new Date(y, m, 0).getDate();
    if (d > ultimoDia) { d = 1; m += 1; }
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

export async function GET(request: Request) {
  const { ano, mes, hoje } = getAnoMes(request);
  const config = hasSupabaseConfig()
    ? await getConfig(ano, mes)
    : mockConfig;
  const lancamentos = hasSupabaseConfig()
    ? await getLancamentos(ano, mes)
    : mockLancamentos;
  if (!config) {
    return NextResponse.json({ dias: [] });
  }
  const { dataInicio: configInicio, dataFim: configFim, totalDisponivel } = config;
  // Se o cliente enviou "hoje" (data do dispositivo), período = hoje até o próximo dia 10
  let dataInicio: string;
  let dataFim: string;
  if (hoje) {
    dataInicio = hoje;
    dataFim = proximoDia10(hoje);
  } else {
    dataInicio = configInicio;
    dataFim = configFim;
  }
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
