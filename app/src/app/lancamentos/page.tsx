"use client";

import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { Wallet, PlusCircle, List, ChevronDown, X } from "lucide-react";
import { CATEGORIAS, TIPOS_LANCAMENTO, MEIOS_PAGAMENTO } from "@/lib/types";
import type { Lancamento } from "@/lib/types";
import { formatDateDDMMYYYY } from "@/lib/format";

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function groupByData(list: Lancamento[]): { data: string; items: Lancamento[] }[] {
  const map = new Map<string, Lancamento[]>();
  for (const l of list) {
    const arr = map.get(l.data) ?? [];
    arr.push(l);
    map.set(l.data, arr);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([data, items]) => ({ data, items }));
}

export default function LancamentosPage({ embedded }: { embedded?: boolean } = {}) {
  const [list, setList] = useState<Lancamento[]>([]);
  const [categoriasList, setCategoriasList] = useState<string[]>([]);
  const [form, setForm] = useState<Partial<Lancamento>>({
    data: new Date().toISOString().slice(0, 10),
    tipo: "Variável",
  });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => fetch("/api/lancamentos").then((r) => r.json()).then(setList);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((arr: { nome: string }[]) => (Array.isArray(arr) && arr.length > 0 ? arr.map((c) => c.nome) : [...CATEGORIAS]))
      .then(setCategoriasList)
      .catch(() => setCategoriasList([...CATEGORIAS]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.data || !form.descricao || form.valor == null) {
      alert("Preencha data, descrição e valor.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/lancamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setForm({ data: form.data, tipo: "Variável" });
        setForm((f) => ({ ...f, descricao: "", valor: undefined }));
        setShowForm(false);
        load();
      } else alert(data.error || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const formBlock = (
    <form onSubmit={submit} className="animate-panel-in bg-surface rounded-xl p-5 border border-[var(--color-border)] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
          <PlusCircle className="size-4 shrink-0 text-primary" aria-hidden />
          Novo gasto ou receita
        </h2>
        <button type="button" onClick={() => setShowForm(false)} className="btn-interactive p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]" aria-label="Fechar">
          <X className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-[var(--color-text-muted)]">Data</label>
        <input type="date" required className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none" value={form.data ?? ""} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} />
        <label className="text-sm text-[var(--color-text-muted)]">Descrição</label>
        <input type="text" required placeholder="Ex: Mercado, Uber" className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 col-span-2 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-primary outline-none" value={form.descricao ?? ""} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
        <label className="text-sm text-[var(--color-text-muted)]">Categoria</label>
        <select className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none" value={form.categoria ?? ""} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
          <option value="">Selecione</option>
          {(categoriasList.length ? categoriasList : CATEGORIAS).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="text-sm text-[var(--color-text-muted)]">Tipo</label>
        <select className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none" value={form.tipo ?? "Variável"} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as Lancamento["tipo"] }))}>
          {TIPOS_LANCAMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="text-sm text-[var(--color-text-muted)]">Valor (R$)</label>
        <input type="number" required step={0.01} min={0} placeholder="0,00" className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-right text-[var(--color-text)] tabular-nums focus:ring-2 focus:ring-primary outline-none" value={form.valor ?? ""} onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))} />
        <label className="text-sm text-[var(--color-text-muted)]">Meio</label>
        <select className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none" value={form.meioPagamento ?? ""} onChange={(e) => setForm((f) => ({ ...f, meioPagamento: e.target.value || undefined }))}>
          <option value="">—</option>
          {MEIOS_PAGAMENTO.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <button type="submit" disabled={saving} className="btn-interactive w-full py-3.5 bg-primary hover:bg-primary-hover rounded-xl font-semibold text-white disabled:opacity-50 transition-colors">{saving ? "Salvando..." : "Anotar"}</button>
    </form>
  );

  const listBlock = (
    <section className="animate-in stagger-2">
      <h2 className="font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <List className="size-4 shrink-0 text-primary" aria-hidden />
        Lista do mês <span className="text-[var(--color-text-muted)] font-normal text-sm">(mais recentes primeiro)</span>
      </h2>
      <div className="rounded-xl bg-surface border border-[var(--color-border)] overflow-hidden">
        {list.length === 0 && (
          <div className="px-4 py-6 text-center text-[var(--color-text-muted)] text-sm">Nenhum lançamento ainda. Toque no botão abaixo para adicionar.</div>
        )}
        {groupByData(list).map((group, gi) => (
          <div key={group.data}>
            {gi > 0 && <hr className="border-[var(--color-border)]" />}
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{formatDateDDMMYYYY(group.data)}</p>
            </div>
            {group.items.map((l) => (
              <div key={l.id ?? l.data + l.descricao + l.valor} className="flex justify-between items-center px-4 py-2 text-sm">
                <span className="text-[var(--color-text)]">{l.descricao} <span className="text-[var(--color-text-muted)]">({l.categoria})</span></span>
                <span className="text-warning font-semibold tabular-nums">{fmt(l.valor)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {list.length > 0 && (
        <p className="mt-2 text-[var(--color-text-muted)] text-sm tabular-nums">
          Total: <span className="font-semibold text-[var(--color-text)]">{fmt(list.reduce((s, l) => s + l.valor, 0))}</span>
        </p>
      )}
    </section>
  );

  if (embedded) {
    return (
      <div className="pb-24 flex-shrink-0 w-full">
        <main className="p-4 max-w-2xl mx-auto space-y-6">
          <h1 className="animate-in stagger-1 text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="size-6 shrink-0 text-primary" aria-hidden />
            Lançamentos
          </h1>
          {listBlock}
          {showForm ? formBlock : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="animate-in stagger-3 btn-interactive w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors font-semibold"
            >
              <PlusCircle className="size-5" aria-hidden />
              Anotar gasto ou receita
              <ChevronDown className="size-5 rotate-[-90deg]" aria-hidden />
            </button>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Nav />
      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <h1 className="animate-in stagger-1 text-xl font-bold text-white flex items-center gap-2">
          <Wallet className="size-6 shrink-0 text-primary" aria-hidden />
          Lançamentos
        </h1>
        {listBlock}
        {showForm ? formBlock : (
          <button type="button" onClick={() => setShowForm(true)} className="animate-in stagger-3 btn-interactive w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors font-semibold">
            <PlusCircle className="size-5" aria-hidden />
            Anotar gasto ou receita
            <ChevronDown className="size-5 rotate-[-90deg]" aria-hidden />
          </button>
        )}
      </main>
    </div>
  );
}
