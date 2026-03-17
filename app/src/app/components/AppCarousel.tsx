"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Wallet,
  PieChart,
  BarChart2,
  MessageCircle,
  Settings,
} from "lucide-react";
import { CarouselProvider } from "@/app/context/CarouselContext";
import HomeSlide from "./slides/HomeSlide";
import LancamentosPage from "@/app/lancamentos/page";
import ResumoPage from "@/app/resumo/page";
import GraficosPage from "@/app/graficos/page";
import IAPage from "@/app/ia/page";

type EmbeddedSlideComponent = React.ComponentType<{ embedded?: boolean }>;
const SLIDES = [
  { id: "home", label: "Início", icon: Home, component: HomeSlide as typeof HomeSlide | EmbeddedSlideComponent },
  { id: "lancamentos", label: "Lançamentos", icon: Wallet, component: LancamentosPage as EmbeddedSlideComponent },
  { id: "resumo", label: "Resumo", icon: PieChart, component: ResumoPage as EmbeddedSlideComponent },
  { id: "graficos", label: "Gráficos", icon: BarChart2, component: GraficosPage as EmbeddedSlideComponent },
  { id: "ia", label: "IA", icon: MessageCircle, component: IAPage as EmbeddedSlideComponent },
];

function CarouselInner() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    el.scrollTo({ left: w * index, behavior: "smooth" });
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const w = el.offsetWidth;
      const i = Math.round(el.scrollLeft / w);
      if (i >= 0 && i < SLIDES.length) setActiveIndex(i);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <CarouselProvider value={{ activeIndex, goToSlide, setActiveIndex }}>
      <header className="sticky top-0 z-20 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)] safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon-192.png" alt="" className="rounded-[5px] shrink-0" width={32} height={32} />
            <span className="text-xl font-bold tracking-tight text-white">Pulse</span>
            <span className="text-[var(--color-text-muted)] text-sm font-normal hidden sm:inline">— finanças em ritmo</span>
          </Link>
          <Link
            href="/config"
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-surface hover:text-[var(--color-text)] transition-colors duration-fast"
            aria-label="Configurações"
          >
            <Settings className="size-5" />
          </Link>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide min-h-[calc(100vh-3.5rem)]"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
      >
        {SLIDES.map(({ component: Component }) => (
          <div
            key={SLIDES.find((s) => s.component === Component)?.id ?? Component.name}
            className="flex-shrink-0 w-full min-w-full snap-start overflow-y-auto"
          >
            {Component === HomeSlide ? (
              <HomeSlide />
            ) : (
              <Component embedded />
            )}
          </div>
        ))}
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] safe-area-inset-bottom"
        aria-label="Navegação principal"
      >
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
          {SLIDES.map(({ label, icon: Icon }, i) => {
            const isActive = activeIndex === i;
            return (
              <button
                key={label}
                type="button"
                onClick={() => goToSlide(i)}
                className={`btn-interactive flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 rounded-xl transition-all duration-normal ${
                  isActive ? "text-primary" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-6 shrink-0" strokeWidth={isActive ? 2.5 : 2} aria-hidden />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </CarouselProvider>
  );
}

export default function AppCarousel() {
  return <CarouselInner />;
}
