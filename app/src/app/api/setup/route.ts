import { NextResponse } from "next/server";
import { seedMesAtual, hasSupabaseConfig } from "@/lib/supabase-db";

export async function POST() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.",
      },
      { status: 400 }
    );
  }
  const result = await seedMesAtual();
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 }
    );
  }
  return NextResponse.json({
    ok: true,
    message: "Mês atual preparado no Supabase.",
  });
}
