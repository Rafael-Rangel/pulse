"use client";

import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { LineChart as LineChartIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { DiaCalendario } from "@/lib/types";
import type { ResumoMensal } from "@/lib/types";
import { formatDateDDMM } from "@/lib/format";

const COLORS = ["#facc15", "#fef08a", "#f5f5f5", "#a3a3a3", "#22c55e", "#f59e0b", "#ef4444", "#737373", "#ffffff", "#eab308"];

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

function GraficosPageInner(props: { embedded?: boolean }) {
  const { embedded } = props;
  const [calendario, setCalendario] = useState<DiaCalendario[]>([]);
  const [resumo, setResumo] = useState<ResumoMensal | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/calendario").then((r) => r.json()),
      fetch("/api/resumo").then((r) => r.json()),
    ]).then(([cal, res]) => {
      setCalendario(cal.dias ?? []);
      setResumo(res);
    });
  }, []);

  const lineData = calendario.map((d) => ({
    data: formatDateDDMM(d.data),
    dataIso: d.data,
    saldo: d.saldoFinal,
  }));

  const barData = calendario.map((d) => ({
    data: formatDateDDMM(d.data),
    dataIso: d.data,
    limite: d.limiteDiario,
    gasto: d.gastoDia,
  }));

  const pieData = resumo?.porCategoria.filter((r) => r.gasto > 0).map((r) => ({ name: r.categoria, value: r.gasto })) ?? [];

  const content = (
    <main className="p-4 max-w-2xl mx-auto space-y-8">
        <h1 className="animate-in stagger-1 text-xl font-bold text-white flex items-center gap-2">
          <LineChartIcon className="size-6 shrink-0 text-primary" aria-hidden />
          Gráficos
        </h1>

        {lineData.length > 0 && (
          <section className="animate-in stagger-2 bg-surface rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)] mb-2">Evolução do saldo (por dia)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="data" stroke="#a3a3a3" fontSize={10} />
                  <YAxis stroke="#a3a3a3" fontSize={10} tickFormatter={(v) => fmt(v)} />
                  <Tooltip formatter={(v) => [typeof v === "number" ? fmt(v) : v, "Saldo"]} labelFormatter={(l) => l} />
                  <Line type="monotone" dataKey="saldo" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {barData.length > 0 && (
          <section className="animate-in stagger-3 bg-surface rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)] mb-2">Gasto diário vs limite</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="data" stroke="#a3a3a3" fontSize={10} />
                  <YAxis stroke="#a3a3a3" fontSize={10} tickFormatter={(v) => fmt(v)} />
                  <Tooltip formatter={(v) => [typeof v === "number" ? fmt(v) : v, ""]} />
                  <Bar dataKey="limite" fill="#404040" name="Limite" radius={4} />
                  <Bar dataKey="gasto" fill="#f59e0b" name="Gasto" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {pieData.length > 0 && (
          <section className="animate-in stagger-4 bg-surface rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)] mb-2">Gasto por categoria</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [typeof v === "number" ? fmt(v) : v, "Gasto"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {calendario.length === 0 && !resumo?.porCategoria?.length && (
          <p className="animate-in stagger-5 text-[var(--color-text-muted)]">Configure o mês e adicione lançamentos para ver os gráficos.</p>
        )}
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

function GraficosPage(props: { embedded?: boolean } & Record<string, unknown>) {
  return <GraficosPageInner embedded={"embedded" in props ? props.embedded : undefined} />;
}
// Next.js App Router expects a specific page props type; this component also accepts embedded for carousel use
export default GraficosPage as React.FC;
