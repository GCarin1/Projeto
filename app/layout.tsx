import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "V8 on Fire — Agendamento da Oficina",
  description:
    "Sistema de agendamento web para a oficina mecânica V8 on Fire.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
