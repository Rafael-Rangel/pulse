import { NextResponse } from "next/server";
import { listCategorias, createCategoria, hasSupabaseConfig } from "@/lib/supabase-db";
import { CATEGORIAS } from "@/lib/types";

export async function GET(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      CATEGORIAS.map((nome, i) => ({ id: i + 1, nome, tipo: "Variável" as const, ativo: true }))
    );
  }
  const url = new URL(request.url);
  const apenasAtivas = url.searchParams.get("ativas") !== "0";
  const items = await listCategorias(apenasAtivas);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: false, error: "Supabase não configurado." }, { status: 400 });
  }
  let body: { nome?: string; tipo?: "Fixo" | "Variável" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }
  const nome = body.nome?.trim();
  const tipo = body.tipo === "Fixo" ? "Fixo" : "Variável";
  if (!nome) {
    return NextResponse.json({ ok: false, error: "Nome da categoria é obrigatório." }, { status: 400 });
  }
  const result = await createCategoria(nome, tipo);
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}
