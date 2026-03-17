"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type DialogKind = "alert" | "confirm";

type DialogState =
  | {
      open: true;
      kind: DialogKind;
      title?: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      destructive?: boolean;
    }
  | { open: false };

type DialogApi = {
  alert: (message: string, opts?: { title?: string; confirmText?: string }) => Promise<void>;
  confirm: (
    message: string,
    opts?: { title?: string; confirmText?: string; cancelText?: string; destructive?: boolean }
  ) => Promise<boolean>;
};

const DialogContext = createContext<DialogApi | null>(null);

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}

export default function DialogProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [state, setState] = useState<DialogState>({ open: false });
  const alertResolveRef = useRef<(() => void) | null>(null);
  const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((value?: boolean) => {
    const ar = alertResolveRef.current;
    const cr = confirmResolveRef.current;
    alertResolveRef.current = null;
    confirmResolveRef.current = null;
    setState({ open: false });
    if (cr) cr(Boolean(value));
    else if (ar) ar();
  }, []);

  const api = useMemo<DialogApi>(() => {
    return {
      alert: (message, opts) =>
        new Promise<void>((resolve) => {
          alertResolveRef.current = resolve;
          setState({
            open: true,
            kind: "alert",
            title: opts?.title,
            message,
            confirmText: opts?.confirmText ?? "OK",
          });
        }),
      confirm: (message, opts) =>
        new Promise<boolean>((resolve) => {
          confirmResolveRef.current = resolve;
          setState({
            open: true,
            kind: "confirm",
            title: opts?.title,
            message,
            confirmText: opts?.confirmText ?? "Confirmar",
            cancelText: opts?.cancelText ?? "Cancelar",
            destructive: opts?.destructive ?? false,
          });
        }),
    };
  }, []);

  return (
    <DialogContext.Provider value={api}>
      {children}

      {state.open && (
        <div
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={state.title ?? (state.kind === "confirm" ? "Confirmação" : "Aviso")}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Fechar"
            onClick={() => close(false)}
          />

          <div className="relative w-full max-w-md animate-panel-in rounded-2xl bg-surface border border-[var(--color-border)] p-5 shadow-2xl">
            {state.title && <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">{state.title}</h3>}
            <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-wrap">{state.message}</p>

            <div className="mt-5 flex gap-2 justify-end">
              {state.kind === "confirm" && (
                <button
                  type="button"
                  className="btn-interactive px-4 py-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]/30 transition-colors"
                  onClick={() => close(false)}
                >
                  {state.cancelText ?? "Cancelar"}
                </button>
              )}

              <button
                type="button"
                className={`btn-interactive px-4 py-2 rounded-xl font-semibold text-white transition-colors ${
                  state.kind === "confirm" && state.destructive
                    ? "bg-error hover:bg-error/90"
                    : "bg-primary hover:bg-primary-hover"
                }`}
                onClick={() => close(true)}
              >
                {state.confirmText ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

