"use client";

import { createContext, useContext } from "react";

interface CarouselContextValue {
  activeIndex: number;
  goToSlide: (index: number) => void;
  setActiveIndex: (index: number) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export function CarouselProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: CarouselContextValue;
}) {
  return (
    <CarouselContext.Provider value={value}>{children}</CarouselContext.Provider>
  );
}

export function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx) return null;
  return ctx;
}
