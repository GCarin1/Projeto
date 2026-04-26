import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./_components/navbar";

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
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-6 mt-16">
          <div className="mx-auto max-w-5xl px-6 text-center text-sm text-slate-500">
            V8 on Fire — Sistema de agendamento da oficina mecânica
          </div>
        </footer>
      </body>
    </html>
  );
}
