"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Receipt,
  TrendingUp,
  Percent,
  PlusCircle,
  Calendar,
  BarChart2,
  ChevronRight,
  PieChart,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { useCarousel } from "@/app/context/CarouselContext";
import { formatDateDDMM } from "@/lib/format";
import type { ResumoMensal } from "@/lib/types";
import type { DiaCalendario } from "@/lib/types";

export default function HomeSlide() {
  const carousel = useCarousel();
  const [resumo, setResumo] = useState<ResumoMensal | null>(null);
  const [calendario, setCalendario] = useState<DiaCalendario[]>([]);

  useEffect(() => {
    fetch("/api/resumo")
      .then((r) => r.json())
      .then(setResumo)
      .catch(() => setResumo(null));
  }, []);

  useEffect(() => {
    fetch("/api/calendario")
      .then((r) => r.json())
      .then((data) => setCalendario(data.dias ?? []))
      .catch(() => setCalendario([]));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  const percent = resumo ? Math.round(resumo.percentualUsado * 100) : 0;
  const overBudget = resumo && (resumo.saldoFinal < 0 || resumo.totalGasto > resumo.totalDisponivel || resumo.porCategoria.some((r) => r.gasto > r.planejado));

  const goTo = (index: number) => {
    if (carousel) carousel.goToSlide(index);
  };

  return (
    <div className="pb-24 min-h-screen flex-shrink-0 w-full">
      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <section className="animate-in stagger-1 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-[var(--color-border)] p-6">
          <p className="text-[var(--color-text-muted)] text-sm font-medium mb-1">Disponível até o próximo dia 10</p>
          {resumo ? (
            <p className={`text-3xl sm:text-4xl font-bold tabular-nums tracking-tight ${resumo.saldoFinal >= 0 ? "text-white" : "text-error"}`}>{fmt(resumo.saldoFinal)}</p>
          ) : (
            <div className="h-10 w-48 skeleton rounded-lg" />
          )}
          <p className="text-[var(--color-text-muted)] text-xs mt-2">Saldo do período (receitas − despesas)</p>
        </section>

        {resumo && (
          <>
            {overBudget && (
              <div className="animate-in stagger-2 rounded-xl bg-error/15 border border-error/50 p-3 flex gap-2">
                <AlertTriangle className="size-5 shrink-0 text-error mt-0.5" aria-hidden />
                <p className="text-sm text-error font-medium">Você passou do orçamento. Remaneje em Config ou peça ajuda à IA.</p>
              </div>
            )}
            <section className="animate-in stagger-2 rounded-xl bg-surface border border-[var(--color-border)] p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--color-text-muted)]">Orçamento do mês</span>
                <span className={`font-medium tabular-nums ${percent > 100 ? "text-error" : ""}`}>{Math.min(percent, 999)}% usado</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[var(--color-surface-elevated)] overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-slow ease-out ${percent > 100 ? "bg-error" : "bg-primary"}`} style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)] tabular-nums">
                <span className={resumo.totalGasto > resumo.totalDisponivel ? "text-error font-medium" : ""}>{fmt(resumo.totalGasto)}</span>
                <span>{fmt(resumo.totalDisponivel)}</span>
              </div>
            </section>
          </>
        )}

        {((resumo && resumo.porCategoria.filter((p) => p.gasto > 0).length > 0) || calendario.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in stagger-2">
            {resumo && resumo.porCategoria.filter((p) => p.gasto > 0).length > 0 && (
              <section className="rounded-xl bg-surface border border-[var(--color-border)] p-4 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <PieChart className="size-4 text-primary shrink-0" aria-hidden />
                  Gasto por categoria
                </h3>
                <div className="h-40 min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...resumo.porCategoria].filter((p) => p.gasto > 0).sort((a, b) => b.gasto - a.gasto).slice(0, 5)}
                      layout="vertical"
                      margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="categoria" width={72} tick={{ fontSize: 10 }} stroke="#a3a3a3" />
                      <Tooltip formatter={(v: number) => [fmt(v), "Gasto"]} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="gasto" fill="#facc15" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
            {calendario.length > 0 && (
              <section className="rounded-xl bg-surface border border-[var(--color-border)] p-4 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Activity className="size-4 text-primary shrink-0" aria-hidden />
                  Evolução do saldo
                </h3>
                <div className="h-36 min-h-[144px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={calendario.slice(-14).map((d) => ({ data: formatDateDDMM(d.data), saldo: d.saldoFinal }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis dataKey="data" stroke="#a3a3a3" fontSize={9} />
                      <YAxis stroke="#a3a3a3" fontSize={9} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                      <Tooltip formatter={(v: number) => [fmt(v), "Saldo"]} labelFormatter={(l) => l} />
                      <Line type="monotone" dataKey="saldo" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </div>
        )}

        {resumo && (() => {
          const topCat = [...resumo.porCategoria].filter((p) => p.gasto > 0).sort((a, b) => b.gasto - a.gasto)[0];
          const mediaDia = calendario.length > 0 ? resumo.totalGasto / calendario.length : 0;
          return (
            <div className="grid grid-cols-2 gap-3 animate-in stagger-2">
              {topCat && (
                <div className="rounded-xl bg-surface border border-[var(--color-border)] p-3">
                  <p className="text-[var(--color-text-muted)] text-xs font-medium">Maior gasto</p>
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate" title={topCat.categoria}>{topCat.categoria}</p>
                  <p className="text-warning text-sm font-semibold tabular-nums">{fmt(topCat.gasto)}</p>
                </div>
              )}
              <div className="rounded-xl bg-surface border border-[var(--color-border)] p-3">
                <p className="text-[var(--color-text-muted)] text-xs font-medium">Média por dia</p>
                <p className="text-lg font-semibold tabular-nums text-[var(--color-text)]">{fmt(mediaDia)}</p>
                <p className="text-[var(--color-text-subtle)] text-xs">{calendario.length} dias no período</p>
              </div>
            </div>
          );
        })()}

        {resumo && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Disponível", value: fmt(resumo.totalDisponivel), Icon: Wallet, color: "text-success" },
              { label: "Já gastou", value: fmt(resumo.totalGasto), Icon: Receipt, color: "text-warning" },
              { label: "Saldo", value: fmt(resumo.saldoFinal), Icon: TrendingUp, color: resumo.saldoFinal >= 0 ? "text-success" : "text-error" },
              { label: "% usado", value: `${(resumo.percentualUsado * 100).toFixed(0)}%`, Icon: Percent, color: "text-white" },
            ].map((item, i) => (
              <div key={item.label} className="animate-in stagger-3 rounded-xl bg-surface border border-[var(--color-border)] p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
                  <item.Icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </div>
                <p className={`text-lg font-semibold tabular-nums ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        <section className="animate-in stagger-7">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Ações rápidas</h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => goTo(1)}
              className="btn-interactive w-full flex items-center justify-between rounded-xl bg-surface border border-[var(--color-border)] p-4 hover:bg-[var(--color-surface-elevated)] transition-colors duration-[150ms] group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary"><PlusCircle className="size-5" aria-hidden /></div>
                <span className="font-medium">Anotar gasto ou receita</span>
              </div>
              <ChevronRight className="size-5 text-[var(--color-text-muted)] group-hover:text-primary transition-colors" />
            </button>
            <Link
              href="/calendario"
              className="btn-interactive flex items-center justify-between rounded-xl bg-surface border border-[var(--color-border)] p-4 hover:bg-[var(--color-surface-elevated)] transition-colors duration-[150ms] group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20 text-secondary"><Calendar className="size-5" aria-hidden /></div>
                <span className="font-medium">Ver por dia (calendário)</span>
              </div>
              <ChevronRight className="size-5 text-[var(--color-text-muted)] group-hover:text-primary transition-colors" />
            </Link>
            <button
              type="button"
              onClick={() => goTo(3)}
              className="btn-interactive w-full flex items-center justify-between rounded-xl bg-surface border border-[var(--color-border)] p-4 hover:bg-[var(--color-surface-elevated)] transition-colors duration-[150ms] group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary"><BarChart2 className="size-5" aria-hidden /></div>
                <span className="font-medium">Gráficos e evolução</span>
              </div>
              <ChevronRight className="size-5 text-[var(--color-text-muted)] group-hover:text-primary transition-colors" />
            </button>
          </div>
        </section>

        {!resumo && <p className="text-[var(--color-text-muted)] text-center py-8">Carregando seus números...</p>}
      </main>
    </div>
  );
}
