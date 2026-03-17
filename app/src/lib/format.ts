/**
 * Formata data no padrão do app: dia/mês/ano (dd/mm/yyyy).
 * Aceita string ISO (YYYY-MM-DD) ou apenas a parte da data.
 */
export function formatDateDDMMYYYY(iso: string): string {
  const s = String(iso).slice(0, 10);
  if (s.length < 10) return s;
  const [y, m, d] = s.split("-");
  return `${d!.padStart(2, "0")}/${m!.padStart(2, "0")}/${y}`;
}

/** Formata apenas dia/mês (dd/mm) quando o ano é o atual. */
export function formatDateDDMM(iso: string): string {
  const s = String(iso).slice(0, 10);
  if (s.length < 10) return s;
  const [, m, d] = s.split("-");
  return `${d!.padStart(2, "0")}/${m!.padStart(2, "0")}`;
}
