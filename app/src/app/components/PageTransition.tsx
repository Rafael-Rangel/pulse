"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Sempre que mudar de página (link/clique), levar o usuário ao topo (como um link #)
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    };
    scrollToTop();
    // Garante após o paint da nova página (caso o router atualize o DOM depois)
    const raf = requestAnimationFrame(() => {
      scrollToTop();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
}
