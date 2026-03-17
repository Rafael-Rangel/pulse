"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Sempre que mudar de página, voltar ao topo (e scroll horizontal a zero)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  }, [pathname]);

  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
}
