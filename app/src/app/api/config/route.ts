import { NextResponse } from "next/server";
import { getConfig, setConfig, hasSupabaseConfig } from "@/lib/supabase-db";
import { mockConfig } from "@/lib/mock";

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
    const data = await getConfig(ano, mes);
    if (data) return NextResponse.json(data);
  }
  return NextResponse.json(mockConfig);
}

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { ok: false, error: "Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 400 }
    );
  }
  const body = await request.json();
  const ok = await setConfig(body);
  return NextResponse.json({ ok });
}
