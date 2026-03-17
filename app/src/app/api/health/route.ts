import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase-db";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const hasConfig = hasSupabaseConfig();
  let db: string = "unconfigured";
  let hint: string | undefined;
  if (hasConfig && supabase) {
    const { data, error } = await supabase.from("categorias").select("id").limit(1);
    if (error) {
      db = "error";
      hint = error.message ?? "Verifique a chave (service_role) e se docs/schema_banco.sql foi executado no Supabase.";
    } else {
      db = data?.length ? "ok" : "empty";
    }
  }
  return NextResponse.json({
    ok: true,
    mode: hasConfig ? "production" : "demo",
    supabase: hasConfig ? db : "skipped",
    ...(hint && { hint }),
  });
}
