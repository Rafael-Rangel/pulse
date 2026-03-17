import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PageTransition from "./components/PageTransition";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulse — Controle Financeiro",
  description: "Suas finanças em ritmo. Controle receitas, despesas, metas e relatórios de forma simples.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Pulse" },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#facc15",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={plusJakarta.variable}>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] font-sans antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
