"use client";

import { useEffect, useState, useRef } from "react";
import Nav from "../components/Nav";
import { Settings, Save, PlusCircle, Pencil, Trash2, Percent, CircleDollarSign, Target } from "lucide-react";
import type { ConfigMes } from "@/lib/types";
import { useDialog } from "../components/DialogProvider";

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

interface CategoriaApi {
  id: number;
  nome: string;
  tipo: "Fixo" | "Variável";
  ativo: boolean;
}

export default function ConfigPage() {
  const dialog = useDialog();
  const [config, setConfig] = useState<ConfigMes | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoriasApi, setCategoriasApi] = useState<CategoriaApi[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [novoTipo, setNovoTipo] = useState<"Fixo" | "Variável">("Variável");
  const [editId, setEditId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editTipo, setEditTipo] = useState<"Fixo" | "Variável">("Variável");

  const loadConfig = () =>
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig(null));

  const loadCategorias = () =>
    fetch("/api/categorias")
      .then((r) => r.json())
      .then(setCategoriasApi)
      .catch(() => setCategoriasApi([]));

  const hasEditedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadConfig();
    loadCategorias();
  }, []);

  const save = async (cfg?: ConfigMes | null) => {
    const c = cfg ?? config;
    if (!c) return;
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...c,
          dataInicio: c.dataInicio,
          dataFim: c.dataFim,
          categorias: c.categorias.map((cat) => ({
            ...cat,
            percentual: cat.percentual,
            ajusteManual: cat.ajusteManual ?? 0,
          })),
        }),
      });
      const data = await res.json();
      if (!data.ok) await dialog.alert(data.error || "Erro ao salvar", { title: "Não foi possível salvar" });
      else {
        hasEditedRef.current = false;
        loadConfig();
      }
    } finally {
      setSaving(false);
    }
  };

  // Auto-save com debounce (800ms) quando config muda após edição
  useEffect(() => {
    if (!config || !hasEditedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      save();
    }, 800);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save is stable, avoid loop
  }, [config]);

  // Salvar ao sair da página (navegação ou fechar aba)
  useEffect(() => {
    const doSaveOnLeave = (cfg: ConfigMes) => {
      hasEditedRef.current = false;
      const body = {
        ...cfg,
        dataInicio: cfg.dataInicio,
        dataFim: cfg.dataFim,
        categorias: cfg.categorias.map((c) => ({
          ...c,
          percentual: c.percentual,
          ajusteManual: c.ajusteManual ?? 0,
        })),
      };
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      navigator.sendBeacon("/api/config", blob);
    };
    const handleBeforeUnload = () => {
      if (hasEditedRef.current && config) doSaveOnLeave(config);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (hasEditedRef.current && config) doSaveOnLeave(config);
    };
  }, [config]);

  const update = (patch: Partial<ConfigMes>) => {
    if (!config) return;
    const next = { ...config, ...patch };
    const total =
      (next.rendaBase ?? 0) +
      (next.rendaExtra ?? 0) +
      (next.saldoInicial ?? 0) -
      (next.gastoAntecipadoExtra ?? 0);
    next.totalDisponivel = total;
    if (next.categorias) {
      next.categorias = next.categorias.map((c) => ({
        ...c,
        valorPlanejado: total * c.percentual,
        limiteDiarioSugerido: (total * c.percentual) / 30,
        valorPlanejadoAjustado: total * c.percentual + (c.ajusteManual ?? 0),
      }));
    }
    hasEditedRef.current = true;
    setConfig(next);
  };

  const updateCat = (index: number, field: string, value: number) => {
    if (!config) return;
    const cat = { ...config.categorias[index], [field]: value };
    if (field === "percentual") {
      cat.valorPlanejado = config.totalDisponivel * value;
      cat.limiteDiarioSugerido = cat.valorPlanejado / 30;
      cat.valorPlanejadoAjustado = cat.valorPlanejado + (cat.ajusteManual ?? 0);
    }
    if (field === "ajusteManual") {
      cat.valorPlanejadoAjustado = cat.valorPlanejado + value;
    }
    const categorias = [...config.categorias];
    categorias[index] = cat;
    hasEditedRef.current = true;
    setConfig({ ...config, categorias });
  };

  const addCategoria = async () => {
    const nome = novoNome.trim();
    if (!nome) return;
    const res = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, tipo: novoTipo }),
    });
    const data = await res.json();
    if (!data.ok) await dialog.alert(data.error || "Erro ao criar categoria", { title: "Erro" });
    else {
      setNovoNome("");
      setNovoTipo("Variável");
      loadCategorias();
      loadConfig();
    }
  };

  const saveEditCategoria = async () => {
    if (editId == null) return;
    const res = await fetch(`/api/categorias/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: editNome.trim(), tipo: editTipo }),
    });
    const data = await res.json();
    if (!data.ok) await dialog.alert(data.error || "Erro ao atualizar", { title: "Erro" });
    else {
      setEditId(null);
      loadCategorias();
      loadConfig();
    }
  };

  const excluirCategoria = async (id: number) => {
    const ok = await dialog.confirm(
      "Excluir esta categoria? Ela deixará de aparecer no app (lançamentos antigos continuam vinculados).",
      { title: "Excluir categoria", confirmText: "Excluir", destructive: true }
    );
    if (!ok) return;
    const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) await dialog.alert(data.error || "Erro ao excluir", { title: "Erro" });
    else {
      loadCategorias();
      loadConfig();
    }
  };

  if (!config) return <><Nav /><main className="p-4 pb-24 flex flex-col items-center gap-4 pt-12"><div className="w-10 h-10 rounded-full border-2 border-[var(--color-border)] border-t-primary animate-spin" /><p className="text-[var(--color-text-muted)]">Carregando...</p><div className="flex gap-2"><span className="skeleton inline-block w-16 h-2 rounded-full" /><span className="skeleton inline-block w-20 h-2 rounded-full" /></div></main></>;

  const totalCat = config.categorias.reduce((s, c) => s + c.valorPlanejadoAjustado, 0);
  const ok = Math.abs(totalCat - config.totalDisponivel) < 1;

  return (
    <div className="pb-24">
      <Nav />
      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <h1 className="animate-in stagger-1 text-xl font-bold text-white flex items-center gap-2">
          <Settings className="size-6 shrink-0 text-primary" aria-hidden />
          Configuração do mês
        </h1>

        <section className="animate-in stagger-2 bg-surface rounded-xl p-5 border border-[var(--color-border)] space-y-3">
          <h2 className="font-semibold text-[var(--color-text)]">Valores do mês</h2>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm text-[var(--color-text-muted)]">Ano</label>
            <input
              type="number"
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-right text-[var(--color-text)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
              value={config.ano}
              onChange={(e) => update({ ano: Number(e.target.value) })}
            />
            <label className="text-sm text-[var(--color-text-muted)]">Mês</label>
            <input
              type="number"
              min={1}
              max={12}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-right text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none"
              value={config.mes}
              onChange={(e) => update({ mes: Number(e.target.value) })}
            />
            <label className="text-sm text-[var(--color-text-muted)]">Renda base (R$)</label>
            <input
              type="number"
              step={0.01}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-right text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none"
              value={config.rendaBase}
              onChange={(e) => update({ rendaBase: Number(e.target.value) })}
            />
            <label className="text-sm text-[var(--color-text-muted)]">Renda extra (R$)</label>
            <input
              type="number"
              step={0.01}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-right text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none"
              value={config.rendaExtra}
              onChange={(e) => update({ rendaExtra: Number(e.target.value) })}
            />
            <label className="text-sm text-[var(--color-text-muted)]">Saldo inicial (R$)</label>
            <input
              type="number"
              step={0.01}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-right text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none"
              value={config.saldoInicial}
              onChange={(e) => update({ saldoInicial: Number(e.target.value) })}
            />
            <label className="text-sm text-[var(--color-text-muted)]">Gasto antecipado do extra (R$)</label>
            <input
              type="number"
              step={0.01}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-right text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none"
              value={config.gastoAntecipadoExtra}
              onChange={(e) => update({ gastoAntecipadoExtra: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className="text-sm text-[var(--color-text-muted)]">Data início (período)</label>
            <input
              type="date"
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none"
              value={config.dataInicio}
              onChange={(e) => update({ dataInicio: e.target.value })}
            />
            <label className="text-sm text-[var(--color-text-muted)]">Data fim (período)</label>
            <input
              type="date"
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none"
              value={config.dataFim}
              onChange={(e) => update({ dataFim: e.target.value })}
            />
          </div>
          <p className="text-xs text-[var(--color-text-subtle)] mt-1">
            Período do calendário. Padrão: de hoje até o próximo dia 10 (salário). Ajuste se o dia do pagamento mudar.
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Total disponível: <span className="text-success font-semibold tabular-nums">{fmt(config.totalDisponivel)}</span>
          </p>
        </section>

        <section className="animate-in stagger-3 bg-surface rounded-xl p-5 border border-[var(--color-border)]">
          <div className="mb-4">
            <h2 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
              <PlusCircle className="size-5 shrink-0 text-primary" aria-hidden />
              Gerenciar categorias
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Crie, edite ou exclua categorias. Excluir só oculta a categoria (não apaga lançamentos).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {categoriasApi.map((c) => (
              <div
                key={c.id}
                className={`rounded-xl border p-4 transition-colors ${
                  editId === c.id
                    ? "border-primary/50 bg-primary/5"
                    : "border-[var(--color-border)]/70 bg-[var(--color-bg)]/50 hover:border-[var(--color-border)]"
                }`}
              >
                {editId === c.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      placeholder="Nome da categoria"
                    />
                    <select
                      className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none"
                      value={editTipo}
                      onChange={(e) => setEditTipo(e.target.value as "Fixo" | "Variável")}
                    >
                      <option value="Fixo">Fixo</option>
                      <option value="Variável">Variável</option>
                    </select>
                    <div className="flex gap-2">
                      <button type="button" onClick={saveEditCategoria} className="btn-interactive flex-1 px-3 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium text-white transition-colors">
                        Salvar
                      </button>
                      <button type="button" onClick={() => setEditId(null)} className="btn-interactive px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-border)]/30 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--color-text)] truncate">{c.nome}</p>
                      <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.tipo === "Fixo" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                        {c.tipo}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => { setEditId(c.id); setEditNome(c.nome); setEditTipo(c.tipo); }} className="btn-interactive p-2 rounded-lg text-[var(--color-text-muted)] hover:text-primary hover:bg-primary/10 transition-colors" aria-label="Editar">
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" onClick={() => excluirCategoria(c.id)} className="btn-interactive p-2 rounded-lg text-[var(--color-text-muted)] hover:text-error hover:bg-error/10 transition-colors" aria-label="Excluir">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)]/30 p-4">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Nova categoria</p>
            <div className="flex flex-wrap gap-2 items-end">
              <label className="sr-only">Nome</label>
              <input
                type="text"
                className="flex-1 min-w-[140px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-primary outline-none"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Alimentação"
              />
              <label className="sr-only">Tipo</label>
              <select
                className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)] focus:ring-2 focus:ring-primary outline-none w-28"
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value as "Fixo" | "Variável")}
              >
                <option value="Fixo">Fixo</option>
                <option value="Variável">Variável</option>
              </select>
              <button type="button" onClick={addCategoria} className="btn-interactive inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium text-white transition-colors">
                <PlusCircle className="size-4" aria-hidden />
                Adicionar
              </button>
            </div>
          </div>
        </section>

        <section className="animate-in stagger-4 bg-surface rounded-xl p-5 border border-[var(--color-border)]">
          <div className="mb-4">
            <h2 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
              <Target className="size-5 shrink-0 text-primary" aria-hidden />
              Categorias (% e ajuste do mês)
            </h2>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">
              <strong>Planejado = (% do total × total) + valor fixo (R$).</strong> Você pode definir cada categoria só por %, só por valor fixo em R$, ou pelos dois (soma). A soma dos planejados deve bater com o total disponível.
            </p>
          </div>

          <div className="space-y-4">
            {config.categorias.map((c, i) => (
              <div
                key={c.nome}
                className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-bg)]/50 p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-medium text-[var(--color-text)]">{c.nome}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.tipo === "Fixo" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                    {c.tipo}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1">
                      <Percent className="size-3.5" aria-hidden />
                      % do total
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      max={100}
                      className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-right text-[var(--color-text)] tabular-nums focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                      value={(c.percentual * 100).toFixed(1)}
                      onChange={(e) => updateCat(i, "percentual", Number(e.target.value) / 100)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1">
                      <CircleDollarSign className="size-3.5" aria-hidden />
                      Valor fixo (R$)
                    </label>
                    <input
                      type="number"
                      step={0.01}
                      className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-right text-[var(--color-text)] tabular-nums focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                      value={c.ajusteManual ?? 0}
                      onChange={(e) => updateCat(i, "ajusteManual", Number(e.target.value))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 items-end sm:items-start">
                    <label className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1">
                      <Target className="size-3.5" aria-hidden />
                      Planejado
                    </label>
                    <div className="w-full rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 text-right">
                      <span className="text-sm font-semibold text-primary tabular-nums">
                        {fmt(c.valorPlanejadoAjustado)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3 ${ok ? "bg-success/10 border border-success/30" : "bg-warning/10 border border-warning/30"}`}>
            <span className="text-sm font-medium text-[var(--color-text)]">Soma das categorias</span>
            <span className={`text-sm font-semibold tabular-nums ${ok ? "text-success" : "text-warning"}`}>
              {fmt(totalCat)}
              {ok ? " ✓" : ""}
            </span>
          </div>
          {!ok && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Ajuste os percentuais ou valores para a soma bater com o total disponível.
            </p>
          )}
        </section>

        <button
          onClick={() => save()}
          disabled={saving}
          className="animate-in stagger-5 btn-interactive w-full py-3.5 bg-primary hover:bg-primary-hover rounded-xl font-semibold text-white disabled:opacity-50 transition-colors duration-fast"
        >
          {saving ? "Salvando..." : <><Save className="size-4 shrink-0 mr-1.5 inline" aria-hidden />Salvar configuração</>}
        </button>
      </main>
    </div>
  );
}
