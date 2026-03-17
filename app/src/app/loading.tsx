export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 bg-[var(--color-bg)]" role="status" aria-label="Carregando">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--color-border)] border-t-primary animate-spin" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-b-primary/40 animate-spin [animation-duration:1.4s] [animation-direction:reverse]" />
      </div>
      <p className="text-[var(--color-text-muted)] text-sm animate-pulse">Carregando...</p>
      <div className="flex gap-2">
        <span className="skeleton inline-block w-16 h-3 rounded-full" />
        <span className="skeleton inline-block w-20 h-3 rounded-full [animation-delay:0.15s]" />
        <span className="skeleton inline-block w-14 h-3 rounded-full [animation-delay:0.3s]" />
      </div>
      <span className="sr-only">Aguarde enquanto a página carrega.</span>
    </div>
  );
}
