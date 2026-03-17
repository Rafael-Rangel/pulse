import { NextResponse } from "next/server";
import { updateCategoria, deleteCategoria, hasSupabaseConfig } from "@/lib/supabase-db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: false, error: "Supabase não configurado." }, { status: 400 });
  }
  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, error: "ID inválido." }, { status: 400 });
  }
  let body: { nome?: string; tipo?: "Fixo" | "Variável" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }
  const result = await updateCategoria(id, {
    nome: body.nome,
    tipo: body.tipo,
  });
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: false, error: "Supabase não configurado." }, { status: 400 });
  }
  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, error: "ID inválido." }, { status: 400 });
  }
  const result = await deleteCategoria(id);
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
