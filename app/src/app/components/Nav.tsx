"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wallet,
  PieChart,
  BarChart2,
  MessageCircle,
  Settings,
} from "lucide-react";

const mainLinks = [
  { href: "/", label: "Início", icon: Home },
  { href: "/lancamentos", label: "Lançamentos", icon: Wallet },
  { href: "/resumo", label: "Resumo", icon: PieChart },
  { href: "/graficos", label: "Gráficos", icon: BarChart2 },
  { href: "/ia", label: "IA", icon: MessageCircle },
];

export default function Nav() {
  const path = usePathname();

  return (
    <>
      {/* Top bar — título da app + config */}
      <header className="sticky top-0 z-20 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)] safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon-192.png" alt="" className="w-8 h-8 rounded-[5px] shrink-0" width={32} height={32} />
            <span className="text-xl font-bold tracking-tight text-white">
              Pulse
            </span>
            <span className="text-[var(--color-text-muted)] text-sm font-normal hidden sm:inline">
              — finanças em ritmo
            </span>
          </Link>
          <Link
            href="/config"
            className="btn-interactive p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-surface hover:text-[var(--color-text)] transition-colors duration-fast"
            aria-label="Configurações"
          >
            <Settings className="size-5" />
          </Link>
        </div>
      </header>

      {/* Bottom navigation — mobile-first fintech */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] safe-area-inset-bottom"
        aria-label="Navegação principal"
      >
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
          {mainLinks.map(({ href, label, icon: Icon }) => {
            const isActive = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={`btn-interactive flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 rounded-xl transition-all duration-normal ${
                  isActive
                    ? "text-primary"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className="size-6 shrink-0"
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden
                />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
