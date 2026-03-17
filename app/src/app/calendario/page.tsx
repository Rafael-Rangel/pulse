"use client";

import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { CalendarDays } from "lucide-react";
import type { DiaCalendario } from "@/lib/types";
import { formatDateDDMMYYYY } from "@/lib/format";

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export default function CalendarioPage() {
  const [dias, setDias] = useState<DiaCalendario[]>([]);

  useEffect(() => {
    fetch("/api/calendario")
      .then((r) => r.json())
      .then((data) => setDias(data.dias ?? []))
      .catch(() => setDias([]));
  }, []);

  return (
    <div className="pb-24">
      <Nav />
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="animate-in stagger-1 text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CalendarDays className="size-6 shrink-0 text-primary" aria-hidden />
          Quanto posso gastar por dia
        </h1>
        <div className="animate-in stagger-2 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-surface">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="text-left py-2.5 px-4">Data</th>
                <th className="text-right py-2.5 px-2">Limite dia</th>
                <th className="text-right py-2.5 px-2">Gasto</th>
                <th className="text-right py-2.5 px-4">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((d) => (
                <tr
                  key={d.data}
                  className={`border-b border-[var(--color-border)]/50 ${
                    d.gastoDia > d.limiteDiario ? "bg-warning/10" : ""
                  } ${d.saldoFinal < 0 ? "bg-error/10" : ""}`}
                >
                  <td className="py-2.5 px-4">
                    <span className="text-[var(--color-text-subtle)] text-xs">{d.diaSemana}</span> {formatDateDDMMYYYY(d.data)}
                  </td>
                  <td className="text-right px-2 tabular-nums text-[var(--color-text-muted)]">{fmt(d.limiteDiario)}</td>
                  <td className={`text-right px-2 tabular-nums font-medium ${d.gastoDia > d.limiteDiario ? "text-error" : "text-warning"}`}>{fmt(d.gastoDia)}</td>
                  <td className={`text-right px-4 font-medium tabular-nums ${d.saldoFinal >= 0 ? "text-success" : "text-error"}`}>
                    {fmt(d.saldoFinal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dias.length === 0 && <p className="animate-in stagger-3 text-[var(--color-text-muted)] mt-4">Carregue a config do mês primeiro.</p>}
      </main>
    </div>
  );
}
