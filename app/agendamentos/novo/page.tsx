"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Servico {
  id: string;
  nome: string;
  duracao_minutos: number;
  preco: number;
}

interface Profissional {
  id: string;
  nome: string;
}

interface Cliente {
  id: string;
  nome: string;
}

const MOCK_SERVICOS: Servico[] = [
  { id: "1", nome: "Revisão Geral", duracao_minutos: 120, preco: 350 },
  { id: "2", nome: "Troca de Óleo", duracao_minutos: 30, preco: 120 },
  { id: "3", nome: "Alinhamento e Balanceamento", duracao_minutos: 60, preco: 180 },
  { id: "4", nome: "Freios", duracao_minutos: 90, preco: 280 },
  { id: "5", nome: "Suspensão", duracao_minutos: 120, preco: 320 },
  { id: "6", nome: "Elétrica", duracao_minutos: 90, preco: 250 },
];

const MOCK_PROFISSIONAIS: Profissional[] = [
  { id: "1", nome: "Ricardo Souza" },
  { id: "2", nome: "Paulo Mendes" },
  { id: "3", nome: "Fernanda Lima" },
];

const MOCK_CLIENTES: Cliente[] = [
  { id: "1", nome: "João Silva" },
  { id: "2", nome: "Maria Santos" },
  { id: "3", nome: "Carlos Oliveira" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    cliente_id: "",
    servico_id: "",
    profissional_id: "",
    data: "",
    hora: "",
  });

  const servico = MOCK_SERVICOS.find((s) => s.id === form.servico_id);
  const profissional = MOCK_PROFISSIONAIS.find((p) => p.id === form.profissional_id);

  const isStep1Valid = form.cliente_id && form.servico_id;
  const isStep2Valid = form.profissional_id && form.data && form.hora;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isStep2Valid) return;
    setSaving(true);
    setTimeout(() => {
      alert("Agendamento criado com sucesso! (mock)");
      router.push("/agendamentos");
    }, 500);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Novo Agendamento</h1>
      <p className="text-slate-600 mb-8">Siga os passos para agendar um serviço.</p>

      <div className="flex items-center gap-2 mb-8">
        <Step number={1} label="Cliente e Serviço" active={step >= 1} done={step > 1} />
        <div className="flex-1 h-px bg-slate-200" />
        <Step number={2} label="Profissional e Horário" active={step >= 2} done={false} />
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Passo 1 — Cliente e Serviço</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cliente</label>
              <select
                required
                value={form.cliente_id}
                onChange={(e) => setForm((f) => ({ ...f, cliente_id: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione um cliente</option>
                {MOCK_CLIENTES.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Serviço</label>
              <select
                required
                value={form.servico_id}
                onChange={(e) => setForm((f) => ({ ...f, servico_id: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione um serviço</option>
                {MOCK_SERVICOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} — {formatCurrency(s.preco)}
                  </option>
                ))}
              </select>
            </div>

            {servico && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm">
                <p><span className="font-medium text-slate-700">Duração estimada:</span> {servico.duracao_minutos} minutos</p>
                <p><span className="font-medium text-slate-700">Valor:</span> {formatCurrency(servico.preco)}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-40"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Passo 2 — Profissional e Horário</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Profissional</label>
              <select
                required
                value={form.profissional_id}
                onChange={(e) => setForm((f) => ({ ...f, profissional_id: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione um profissional</option>
                {MOCK_PROFISSIONAIS.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
                <input
                  required
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.data}
                  onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Horário</label>
                <select
                  required
                  value={form.hora}
                  onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Selecione</option>
                  {["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"].map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {servico && profissional && form.data && form.hora && (
              <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 text-sm">
                <p className="font-medium text-orange-900">Resumo do agendamento:</p>
                <p className="text-orange-700">Cliente: {MOCK_CLIENTES.find((c) => c.id === form.cliente_id)?.nome}</p>
                <p className="text-orange-700">Serviço: {servico.nome}</p>
                <p className="text-orange-700">Profissional: {profissional.nome}</p>
                <p className="text-orange-700">Data/Hora: {form.data} às {form.hora}</p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ← Voltar
              </button>
              <button
                type="submit"
                disabled={!isStep2Valid || saving}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-40"
              >
                {saving ? "Salvando..." : "Confirmar Agendamento"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function Step({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${active ? "text-orange-600" : "text-slate-400"}`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border-2
        ${done ? "bg-orange-600 border-orange-600 text-white" : active ? "border-orange-600 text-orange-600" : "border-slate-300 text-slate-400"}`}>
        {done ? "✓" : number}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
