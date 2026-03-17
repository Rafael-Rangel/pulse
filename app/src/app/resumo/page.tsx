"use client";

import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { PieChart, Wallet, Receipt, TrendingUp, Percent, Table2, AlertTriangle } from "lucide-react";
import type { ResumoMensal } from "@/lib/types";

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function ResumoPageInner(props: { embedded?: boolean }) {
  const { embedded } = props;
  const [resumo, setResumo] = useState<ResumoMensal | null>(null);

  useEffect(() => {
    fetch("/api/resumo")
      .then((r) => r.json())
      .then(setResumo)
      .catch(() => setResumo(null));
  }, []);

  if (!resumo) {
    if (embedded) {
      return (
        <div className="pb-24 flex-shrink-0 w-full">
          <main className="p-4 flex flex-col items-center gap-4 pt-12">
            <div className="w-10 h-10 rounded-full border-2 border-[var(--color-border)] border-t-primary animate-spin" />
            <p className="text-[var(--color-text-muted)]">Carregando...</p>
          </main>
        </div>
      );
    }
    return (
      <>
        <Nav />
        <main className="p-4 pb-24 flex flex-col items-center gap-4 pt-12">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--color-border)] border-t-primary animate-spin" />
          <p className="text-[var(--color-text-muted)]">Carregando...</p>
          <div className="flex gap-2">
            <span className="skeleton inline-block w-16 h-2 rounded-full" />
            <span className="skeleton inline-block w-20 h-2 rounded-full" />
          </div>
        </main>
      </>
    );
  }

  const content = (
    <main className="p-4 max-w-2xl mx-auto space-y-6">
        <h1 className="animate-in stagger-1 text-xl font-bold text-white flex items-center gap-2">
          <PieChart className="size-6 shrink-0 text-primary" aria-hidden />
          Resumo do mês
        </h1>

        {(resumo.saldoFinal < 0 || resumo.totalGasto > resumo.totalDisponivel || resumo.porCategoria.some((r) => r.gasto > r.planejado)) && (
          <div className="animate-in stagger-2 rounded-xl bg-error/15 border border-error/50 p-4 flex gap-3">
            <AlertTriangle className="size-5 shrink-0 text-error mt-0.5" aria-hidden />
            <div>
              <p className="font-semibold text-error">Atenção: você gastou além do planejado</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {resumo.saldoFinal < 0 && "Saldo negativo. "}
                {resumo.totalGasto > resumo.totalDisponivel && "Gasto total maior que o disponível. "}
                {resumo.porCategoria.some((r) => r.gasto > r.planejado) && "Algumas categorias passaram do limite. "}
                Remaneje em Config (ajuste % ou valor fixo) ou peça ajuda à IA para reequilibrar.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="animate-in stagger-2 bg-surface rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-1">
            <p className="text-[var(--color-text-muted)] text-sm flex items-center gap-1.5"><Wallet className="size-4" aria-hidden /> Total disponível</p>
            <p className="text-lg font-semibold text-success">{fmt(resumo.totalDisponivel)}</p>
          </div>
          <div className="animate-in stagger-3 bg-surface rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-1">
            <p className="text-[var(--color-text-muted)] text-sm flex items-center gap-1.5"><Receipt className="size-4" aria-hidden /> Total gasto</p>
            <p className={`text-lg font-semibold ${resumo.totalGasto > resumo.totalDisponivel ? "text-error" : "text-warning"}`}>{fmt(resumo.totalGasto)}</p>
          </div>
          <div className="animate-in stagger-4 bg-surface rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-1">
            <p className="text-[var(--color-text-muted)] text-sm flex items-center gap-1.5"><TrendingUp className="size-4" aria-hidden /> Saldo final</p>
            <p className={`text-lg font-semibold ${resumo.saldoFinal >= 0 ? "text-success" : "text-error"}`}>
              {fmt(resumo.saldoFinal)}
            </p>
          </div>
          <div className="animate-in stagger-5 bg-surface rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-1">
            <p className="text-[var(--color-text-muted)] text-sm flex items-center gap-1.5"><Percent className="size-4" aria-hidden /> % usado</p>
            <p className={`text-lg font-semibold ${resumo.percentualUsado > 1 ? "text-error" : ""}`}>{(resumo.percentualUsado * 100).toFixed(0)}%</p>
          </div>
        </div>

        <section className="animate-in stagger-6">
          <h2 className="font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
            <Table2 className="size-4 shrink-0 text-primary" aria-hidden />
            Por categoria <span className="text-[var(--color-text-muted)] font-normal text-xs">(ordenado pela que mais gastou)</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                  <th className="text-left py-2">Categoria</th>
                  <th className="text-right py-2">Planejado</th>
                  <th className="text-right py-2">Gasto</th>
                  <th className="text-right py-2">Diferença</th>
                </tr>
              </thead>
              <tbody>
                {[...resumo.porCategoria].sort((a, b) => b.gasto - a.gasto).map((r) => (
                  <tr key={r.categoria} className={`border-b border-[var(--color-border)]/50 ${r.gasto > r.planejado ? "bg-error/10" : ""}`}>
                    <td className="py-1.5 font-medium">{r.categoria}</td>
                    <td className="text-right text-[var(--color-text-muted)]">{fmt(r.planejado)}</td>
                    <td className={`text-right font-medium ${r.gasto > r.planejado ? "text-error" : "text-warning"}`}>{fmt(r.gasto)}</td>
                    <td className={`text-right font-medium ${r.diferenca >= 0 ? "text-success" : "text-error"}`}>
                      {fmt(r.diferenca)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[var(--color-text-subtle)] text-xs">
            Remanejamento: use a página Config para ajustar % e “Ajuste R$” entre categorias.
          </p>
        </section>
      </main>
  );

  if (embedded) {
    return (
      <div className="pb-24 flex-shrink-0 w-full">
        {content}
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Nav />
      {content}
    </div>
  );
}

function ResumoPage(props: { embedded?: boolean } & Record<string, unknown>) {
  return <ResumoPageInner embedded={"embedded" in props ? props.embedded : undefined} />;
}
export default ResumoPage as React.FC;
