"use client";

import { useState } from "react";

interface Agendamento {
  id: string;
  cliente: string;
  veiculo: string;
  profissional: string;
  servico: string;
  data_hora: string;
  status: "pendente" | "confirmado" | "concluido" | "cancelado";
}

const MOCK_AGENDAMENTOS: Agendamento[] = [
  { id: "1", cliente: "João Silva", veiculo: "Volkswagen Gol ABC-1234", profissional: "Ricardo Souza", servico: "Troca de Óleo", data_hora: "2026-04-28T09:00", status: "pendente" },
  { id: "2", cliente: "Maria Santos", veiculo: "Chevrolet Onix DEF-5678", profissional: "Paulo Mendes", servico: "Freios", data_hora: "2026-04-28T10:30", status: "confirmado" },
  { id: "3", cliente: "Carlos Oliveira", veiculo: "Ford Fiesta GHI-9012", profissional: "Fernanda Lima", servico: "Elétrica", data_hora: "2026-04-29T14:00", status: "pendente" },
];

const STATUS_LABELS: Record<Agendamento["status"], { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  concluido: { label: "Concluído", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-slate-100 text-slate-600" },
};

function formatDateTime(dt: string) {
  const d = new Date(dt);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(MOCK_AGENDAMENTOS);

  function handleStatusChange(id: string, newStatus: Agendamento["status"]) {
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Agenda</h1>
        <a
          href="/agendamentos/novo"
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          + Novo Agendamento
        </a>
      </div>

      <div className="space-y-3">
        {agendamentos.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500 shadow-sm">
            Nenhum agendamento encontrado.
          </div>
        ) : (
          agendamentos.map((a) => {
            const statusInfo = STATUS_LABELS[a.status];
            return (
              <div
                key={a.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-semibold text-slate-900">{a.cliente}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Veículo:</span> {a.veiculo}
                    </p>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Serviço:</span> {a.servico}
                    </p>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Profissional:</span> {a.profissional}
                    </p>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium">Data/Hora:</span> {formatDateTime(a.data_hora)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {a.status === "pendente" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(a.id, "confirmado")}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleStatusChange(a.id, "cancelado")}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {a.status === "confirmado" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(a.id, "concluido")}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                        >
                          Concluir
                        </button>
                        <button
                          onClick={() => handleStatusChange(a.id, "cancelado")}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {a.status === "concluido" && (
                      <span className="text-xs text-green-600 font-medium pt-1">✓ Concluído</span>
                    )}
                    {a.status === "cancelado" && (
                      <span className="text-xs text-slate-500 font-medium pt-1">✕ Cancelado</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
