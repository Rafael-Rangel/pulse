"use client";

import React, { useState, useRef, useEffect } from "react";
import Nav from "../components/Nav";
import { MessageCircle, Send, Check, AlertCircle, Mic, MicOff } from "lucide-react";
import type { ConfigMes, SuggestedAction } from "@/lib/types";

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestedActions?: SuggestedAction[];
}

function IAPageInner(props: { embedded?: boolean }) {
  const { embedded } = props;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversaId, setConversaId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [listening, setListening] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Carregar histórico do chat (Supabase)
  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data: { conversaId?: number | null; messages?: ChatMessage[] }) => {
        if (data.conversaId != null) setConversaId(data.conversaId);
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Reconhecimento de voz (Web Speech API) — preenche o input
  const startVoiceInput = () => {
    if (typeof window === "undefined") return;
    const Win = window as unknown as { SpeechRecognition?: new () => { start: () => void; lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: unknown) => void) | null; onend: (() => void) | null; onerror: (() => void) | null }; webkitSpeechRecognition?: new () => { start: () => void; lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: unknown) => void) | null; onend: (() => void) | null; onerror: (() => void) | null } };
    const Recognition = Win.SpeechRecognition ?? Win.webkitSpeechRecognition;
    if (!Recognition) {
      setToast({ type: "err", text: "Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge." });
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    setListening(true);
    recognition.onresult = (event: unknown) => {
      const e = event as { results?: { [i: number]: { [j: number]: { transcript?: string } } }; resultIndex?: number };
      const transcript = e.results?.[e.resultIndex ?? 0]?.[0]?.transcript ?? "";
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  };

  const applyAction = async (
    action: SuggestedAction,
    msgIndex: number,
    actionIndex: number
  ) => {
    const id = `${msgIndex}-${actionIndex}`;
    setApplyingId(id);
    try {
      const now = new Date();
      const ano = now.getFullYear();
      const mes = now.getMonth() + 1;

      if (action.type === "add_lancamento") {
        const res = await fetch(
          `/api/lancamentos?ano=${ano}&mes=${mes}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: action.payload.data,
              descricao: action.payload.descricao,
              categoria: action.payload.categoria,
              valor: action.payload.valor,
              tipo: action.payload.tipo ?? "Variável",
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setToast({ type: "err", text: data.error ?? "Erro ao adicionar lançamento." });
          return;
        }
        setToast({ type: "ok", text: "Lançamento adicionado." });
        // Remove a ação da mensagem para não clicar de novo
        setMessages((m) =>
          m.map((msg, i) =>
            i === msgIndex && msg.suggestedActions
              ? {
                  ...msg,
                  suggestedActions: msg.suggestedActions.filter((_, j) => j !== actionIndex),
                }
              : msg
          )
        );
      }

      if (action.type === "update_config") {
        const configRes = await fetch(`/api/config?ano=${ano}&mes=${mes}`);
        const config: ConfigMes = await configRes.json();
        if (!config) {
          setToast({ type: "err", text: "Não foi possível carregar a config." });
          return;
        }
        const payload = action.payload;

        // Normalizar percentuais vindos da IA:
        // - Se > 1 e <= 100, tratar como percentual (ex.: 5 => 0.05, 30 => 0.30)
        // - Se > 100, limitar em 100% (1.0)
        const normalizePercent = (p?: number, fallback?: number) => {
          if (p == null) return fallback ?? 0;
          if (p <= 0) return 0;
          if (p > 1 && p <= 100) return p / 100;
          if (p > 100) return 1;
          return p;
        };

        const merged: ConfigMes = {
          ...config,
          rendaBase: payload.rendaBase ?? config.rendaBase,
          rendaExtra: payload.rendaExtra ?? config.rendaExtra,
          saldoInicial: payload.saldoInicial ?? config.saldoInicial,
          gastoAntecipadoExtra: payload.gastoAntecipadoExtra ?? config.gastoAntecipadoExtra,
        };
        merged.totalDisponivel =
          merged.rendaBase + merged.rendaExtra + merged.saldoInicial - merged.gastoAntecipadoExtra;
        if (payload.categorias?.length) {
          merged.categorias = config.categorias.map((c) => {
            const up = payload.categorias!.find((x) => x.nome === c.nome);
            if (!up) return c;
            const percentual = normalizePercent(up.percentual, c.percentual);
            const ajusteManual = up.ajusteManual ?? c.ajusteManual ?? 0;
            const total = merged.totalDisponivel;
            return {
              ...c,
              percentual,
              valorPlanejado: total * percentual,
              limiteDiarioSugerido: (total * percentual) / 30,
              ajusteManual,
              valorPlanejadoAjustado: total * percentual + ajusteManual,
            };
          });
        }
        const res = await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merged),
        });
        const data = await res.json();
        if (!data.ok) {
          setToast({ type: "err", text: data.error ?? "Erro ao atualizar config." });
          return;
        }
        setToast({ type: "ok", text: "Configuração atualizada." });
        setMessages((m) =>
          m.map((msg, i) =>
            i === msgIndex && msg.suggestedActions
              ? {
                  ...msg,
                  suggestedActions: msg.suggestedActions.filter((_, j) => j !== actionIndex),
                }
              : msg
          )
        );
      }
    } finally {
      setApplyingId(null);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          conversa_id: conversaId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Erro: ${data.error ?? "Não foi possível responder."}` },
        ]);
        return;
      }
      if (data.conversaId != null) setConversaId(data.conversaId);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.content ?? "",
          suggestedActions: data.suggestedActions,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Erro de conexão. Tente de novo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const actionLabel = (action: SuggestedAction): string => {
    if (action.type === "add_lancamento") {
      return `Adicionar: ${action.payload.descricao} (${action.payload.categoria}) ${fmt(action.payload.valor)}`;
    }
    if (action.type === "update_config") {
      const p = action.payload;
      const parts: string[] = [];
      if (p.rendaBase != null) parts.push(`Renda base ${fmt(p.rendaBase)}`);
      if (p.rendaExtra != null) parts.push(`Renda extra ${fmt(p.rendaExtra)}`);
      if (p.categorias?.length) parts.push(`Ajustar categorias`);
      return parts.length ? `Aplicar: ${parts.join(", ")}` : "Aplicar configuração";
    }
    return "Aplicar";
  };

  const content = (
    <>
      {toast && (
        <div
          className={`animate-scale-in fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ${
            toast.type === "ok" ? "bg-secondary text-black" : "bg-error text-white"
          }`}
        >
          {toast.type === "ok" ? (
            <Check className="size-5 shrink-0" />
          ) : (
            <AlertCircle className="size-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}
      <main className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full">
        <h1 className="animate-in stagger-1 text-xl font-bold text-white flex items-center gap-2 mb-4">
          <MessageCircle className="size-6 shrink-0 text-primary" aria-hidden />
          Assistente financeiro
        </h1>
        <p className="animate-in stagger-2 text-[var(--color-text-muted)] text-sm mb-3">
          Fale sobre configuração, lançamentos, resumo, calendário e gráficos. Peça para registrar um
          gasto ou alterar renda e categorias — a IA pode sugerir ações para você aplicar.
        </p>

        <div
          ref={listRef}
          className="animate-in stagger-3 flex-1 overflow-y-auto space-y-3 mb-4 rounded-xl bg-surface border border-[var(--color-border)] p-4 min-h-[200px]"
        >
          {loadingHistory && (
            <p className="text-[var(--color-text-muted)] text-sm">Carregando histórico...</p>
          )}
          {!loadingHistory && messages.length === 0 && (
            <p className="text-[var(--color-text-subtle)] text-sm">Envie uma mensagem para começar.</p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex animate-in ${msg.role === "user" ? "justify-end" : "justify-start"} flex-col gap-1`}
              style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-white ml-auto"
                    : "bg-[var(--color-surface-elevated)] text-[var(--color-text)] border border-[var(--color-border)]"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "assistant" && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.suggestedActions.map((action, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => applyAction(action, i, j)}
                      disabled={applyingId !== null}
                      className="animate-scale-in btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover text-black text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ animationDelay: `${Math.min(i * 45 + (j + 1) * 40, 500)}ms` }}
                    >
                      {applyingId === `${i}-${j}` ? (
                        "Aplicando..."
                      ) : (
                        <>
                          <Check className="size-3.5" />
                          {actionLabel(action)}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in">
              <div className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] rounded-xl px-3 py-2 text-sm">
                Pensando...
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="animate-in stagger-4 flex gap-2 items-center"
        >
          <button
            type="button"
            onClick={startVoiceInput}
            disabled={loading || listening}
            className={`btn-interactive p-2.5 rounded-xl shrink-0 ${listening ? "bg-error text-white animate-pulse" : "bg-surface border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            aria-label={listening ? "Gravando... clique para parar" : "Falar (preenche o campo)"}
            title={listening ? "Gravando..." : "Clique e fale para preencher o texto"}
          >
            {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ou peça para registrar um gasto... (ou use o microfone)"
            className="flex-1 bg-surface border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-interactive p-2.5 bg-primary rounded-xl text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors"
            aria-label="Enviar"
          >
            <Send className="size-5" aria-hidden />
          </button>
        </form>
      </main>
    </>
  );

  if (embedded) {
    return (
      <div className="pb-24 flex flex-col flex-shrink-0 w-full">
        {content}
      </div>
    );
  }
  return (
    <div className="pb-24 flex flex-col">
      <Nav />
      {content}
    </div>
  );
}

function IAPage(props: { embedded?: boolean } & Record<string, unknown>) {
  return <IAPageInner embedded={"embedded" in props ? props.embedded : undefined} />;
}
export default IAPage as React.FC;
