import { NextResponse } from "next/server";
import { updateLancamento, deleteLancamento, hasSupabaseConfig } from "@/lib/supabase-db";
import type { Lancamento } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }
  const body = (await request.json()) as Lancamento;
  if (!body.data || !body.descricao || body.valor == null) {
    return NextResponse.json(
      { ok: false, error: "data, descricao e valor são obrigatórios" },
      { status: 400 }
    );
  }
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: false, error: "Modo demo: edição não disponível" }, { status: 400 });
  }
  const result = await updateLancamento(idNum, body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: false, error: "Modo demo: exclusão não disponível" }, { status: 400 });
  }
  const result = await deleteLancamento(idNum);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
