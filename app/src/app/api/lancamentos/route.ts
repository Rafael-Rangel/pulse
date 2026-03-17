import { NextResponse } from "next/server";
import { getLancamentos, appendLancamento, hasSupabaseConfig } from "@/lib/supabase-db";
import { mockLancamentos } from "@/lib/mock";
import type { Lancamento } from "@/lib/types";

function getAnoMes(request: Request): { ano: number; mes: number } {
  const url = new URL(request.url);
  const now = new Date();
  const ano = parseInt(url.searchParams.get("ano") ?? "", 10) || now.getFullYear();
  const mes = parseInt(url.searchParams.get("mes") ?? "", 10) || now.getMonth() + 1;
  return { ano, mes };
}

export async function GET(request: Request) {
  const { ano, mes } = getAnoMes(request);
  if (hasSupabaseConfig()) {
    const data = await getLancamentos(ano, mes);
    return NextResponse.json(data);
  }
  return NextResponse.json(mockLancamentos);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Lancamento;
  if (!body.data || !body.descricao || body.valor == null) {
    return NextResponse.json(
      { ok: false, error: "data, descricao e valor são obrigatórios" },
      { status: 400 }
    );
  }
  const { ano, mes } = getAnoMes(request);
  if (hasSupabaseConfig()) {
    const ok = await appendLancamento(body, ano, mes);
    return NextResponse.json({ ok });
  }
  return NextResponse.json({ ok: true, message: "Modo demo: não salvo" });
}
