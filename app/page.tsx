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
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow hover:bg-orange-50"
        >
          <div className="text-3xl mb-2" aria-hidden="true">📅</div>
          <h2 className="text-xl font-semibold text-slate-900">Agenda</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ver agendamentos e gerenciar status.
          </p>
        </a>

        <a
          href="/agendamentos/novo"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow hover:bg-orange-50"
        >
          <div className="text-3xl mb-2" aria-hidden="true">➕</div>
          <h2 className="text-xl font-semibold text-slate-900">Novo Agendamento</h2>
          <p className="mt-1 text-sm text-slate-600">
            Marcar um serviço para um cliente.
          </p>
        </a>

        <a
          href="/clientes"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow hover:bg-orange-50"
        >
          <div className="text-3xl mb-2" aria-hidden="true">👥</div>
          <h2 className="text-xl font-semibold text-slate-900">Clientes</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cadastro de clientes e veículos.
          </p>
        </a>

        <a
          href="/servicos"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow hover:bg-orange-50"
        >
          <div className="text-3xl mb-2" aria-hidden="true">🔧</div>
          <h2 className="text-xl font-semibold text-slate-900">Serviços</h2>
          <p className="mt-1 text-sm text-slate-600">
            Catálogo de serviços e profissionais.
          </p>
        </a>
      </section>

      <footer className="mt-16 text-sm text-slate-500">
        Frontend em mock — aguardando integração com backend Python/Supabase.
      </footer>
    </main>
  );
}
