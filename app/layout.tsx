import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "V8 on Fire — Agendamento da Oficina",
  description:
    "Sistema de agendamento web para a oficina mecânica V8 on Fire.",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
          <div className="mx flex max-w-5xl items-center justify-between px-6 py-3 mx-auto">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-orange-600">
                🔥 V8 on Fire
              </Link>
              <nav className="hidden md:flex gap-1">
                <NavLink href="/agendamentos">Agenda</NavLink>
                <NavLink href="/agendamentos/novo">Novo Agendamento</NavLink>
                <NavLink href="/clientes">Clientes</NavLink>
                <NavLink href="/veiculos">Veículos</NavLink>
                <NavLink href="/profissionais">Profissionais</NavLink>
                <NavLink href="/servicos">Serviços</NavLink>
              </nav>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-6 mt-16">
          <div className="mx-auto max-w-5xl px-6 text-center text-sm text-slate-500">
            V8 on Fire — Sistema de agendamento da oficina mecânica
          </div>
        </footer>
      </body>
    </html>
  );
}
