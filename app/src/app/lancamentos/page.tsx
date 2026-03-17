"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "../components/Nav";
import { Wallet, PlusCircle, List, ChevronDown, X, Pencil, Trash2 } from "lucide-react";
import { CATEGORIAS, TIPOS_LANCAMENTO, MEIOS_PAGAMENTO } from "@/lib/types";
import type { Lancamento } from "@/lib/types";
import { formatDateDDMMYYYY } from "@/lib/format";
import { useDialog } from "../components/DialogProvider";

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

function LancamentosPageInner(props: { embedded?: boolean }) {
  const { embedded } = props;
  const searchParams = useSearchParams();
  const dialog = useDialog();
  const [list, setList] = useState<Lancamento[]>([]);
  const [categoriasList, setCategoriasList] = useState<string[]>([]);
  const [form, setForm] = useState<Partial<Lancamento>>({
    data: new Date().toISOString().slice(0, 10),
    tipo: "Variável",
  });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => fetch("/api/lancamentos").then((r) => r.json()).then(setList);

  useEffect(() => {
    load();
  }, []);

  // Abrir o formulário ao vir por link "Anotar gasto" (ex.: /lancamentos?openForm=1)
  useEffect(() => {
    if (searchParams.get("openForm") === "1") setShowForm(true);
  }, [searchParams]);

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
      await dialog.alert("Preencha data, descrição e valor.", { title: "Campos obrigatórios" });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/lancamentos/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.ok) {
          setEditingId(null);
          setShowForm(false);
          setForm({ data: form.data, tipo: "Variável" });
          setForm((f) => ({ ...f, descricao: "", valor: undefined }));
          load();
        } else await dialog.alert(data.error || "Erro ao atualizar", { title: "Erro" });
      } else {
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
        } else await dialog.alert(data.error || "Erro ao salvar", { title: "Erro" });
      }
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (l: Lancamento) => {
    if (!l.id) return;
    setEditingId(l.id);
    setForm({
      data: l.data,
      descricao: l.descricao,
      categoria: l.categoria,
      tipo: l.tipo,
      valor: l.valor,
      meioPagamento: l.meioPagamento,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ data: form.data ?? new Date().toISOString().slice(0, 10), tipo: "Variável" });
    setForm((f) => ({ ...f, descricao: "", valor: undefined }));
  };

  const deleteLancamento = async (id: string) => {
    const ok = await dialog.confirm("Excluir este lançamento? Não é possível desfazer.", {
      title: "Excluir lançamento",
      confirmText: "Excluir",
      destructive: true,
    });
    if (!ok) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/lancamentos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) load();
      else await dialog.alert(data.error || "Erro ao excluir", { title: "Erro" });
    } finally {
      setDeletingId(null);
    }
  };

  const formBlock = (
    <form onSubmit={submit} className="animate-panel-in bg-surface rounded-xl p-5 border border-[var(--color-border)] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
          {editingId ? (
            <> <Pencil className="size-4 shrink-0 text-primary" aria-hidden /> Editar lançamento </>
          ) : (
            <> <PlusCircle className="size-4 shrink-0 text-primary" aria-hidden /> Novo gasto </>
          )}
        </h2>
        <button type="button" onClick={closeForm} className="btn-interactive p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]" aria-label="Fechar">
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
      <button type="submit" disabled={saving} className="btn-interactive w-full py-3.5 bg-primary hover:bg-primary-hover rounded-xl font-semibold text-white disabled:opacity-50 transition-colors">{saving ? "Salvando..." : editingId ? "Salvar alterações" : "Anotar"}</button>
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
              <div key={l.id ?? l.data + l.descricao + l.valor} className="flex justify-between items-center gap-2 px-4 py-2 text-sm group/item">
                <span className="flex-1 min-w-0">
                  <span className="text-[var(--color-text)]">{l.descricao}</span>
                  <span className="text-[var(--color-text-muted)]"> ({l.categoria})</span>
                </span>
                <span className="text-warning font-semibold tabular-nums shrink-0">{fmt(l.valor)}</span>
                {l.id && (
                  <span className="flex shrink-0 gap-0.5 opacity-70 group-hover/item:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => openEdit(l)}
                      className="btn-interactive p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-primary hover:bg-primary/10"
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteLancamento(l.id!)}
                      disabled={deletingId === l.id}
                      className="btn-interactive p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-error hover:bg-error/10 disabled:opacity-50"
                      aria-label="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                )}
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
              Anotar gasto
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
            Anotar gasto
            <ChevronDown className="size-5 rotate-[-90deg]" aria-hidden />
          </button>
        )}
      </main>
    </div>
  );
}

function LancamentosPage(props: { embedded?: boolean } & Record<string, unknown>) {
  return <LancamentosPageInner embedded={"embedded" in props ? props.embedded : undefined} />;
}
export default LancamentosPage as React.FC;
