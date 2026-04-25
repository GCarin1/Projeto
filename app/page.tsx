export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">
        V8 on Fire
      </h1>
      <p className="mt-2 text-lg text-slate-600">
        Sistema de agendamento da oficina mecânica.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href="/agendamentos"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="text-xl font-semibold">Agenda</h2>
          <p className="mt-1 text-sm text-slate-600">
            Visualizar e gerenciar os agendamentos.
          </p>
        </a>

        <a
          href="/agendamentos/novo"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="text-xl font-semibold">Novo agendamento</h2>
          <p className="mt-1 text-sm text-slate-600">
            Marcar um serviço para um cliente.
          </p>
        </a>

        <a
          href="/clientes"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="text-xl font-semibold">Clientes</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cadastro de clientes e veículos.
          </p>
        </a>

        <a
          href="/servicos"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="text-xl font-semibold">Serviços</h2>
          <p className="mt-1 text-sm text-slate-600">
            Catálogo de serviços e profissionais.
          </p>
        </a>
      </section>

      <footer className="mt-16 text-sm text-slate-500">
        Etapa 1 — Fundação. Próximas funcionalidades chegam em breve.
      </footer>
    </main>
  );
}
