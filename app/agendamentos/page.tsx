"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  api,
  type Agendamento,
  type AgendamentoStatus,
} from "@/lib/api";
import {
  PROXIMIDADE_COR,
  PROXIMIDADE_LABEL,
  calcularProximidade,
} from "@/lib/proximidade";

const STATUS_LABELS: Record<
  AgendamentoStatus,
  { label: string; color: string }
> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  concluido: { label: "Concluído", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-slate-100 text-slate-600" },
};

/** Status que ainda devem ser destacados como "próximos". */
const STATUS_ATIVOS: ReadonlySet<AgendamentoStatus> = new Set([
  "pendente",
  "confirmado",
]);

function formatDateTime(dt: string) {
  const d = new Date(dt);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function carregar() {
    try {
      setLoadError(null);
      const data = await api.agendamentos.listar();
      setAgendamentos(data);
    } catch (e) {
      setLoadError(
        e instanceof ApiError ? e.message : "Erro ao carregar agendamentos",
      );
      setAgendamentos([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleStatusChange(id: string, novo: AgendamentoStatus) {
    setUpdatingId(id);
    try {
      await api.agendamentos.atualizarStatus(id, novo);
      await carregar();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erro ao atualizar.");
    } finally {
      setUpdatingId(null);
    }
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

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="space-y-3">
        {agendamentos === null ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500 shadow-sm">
            Carregando...
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500 shadow-sm">
            Nenhum agendamento encontrado.
          </div>
        ) : (
          agendamentos.map((a) => {
            const statusInfo = STATUS_LABELS[a.status];
            const veiculoStr = a.veiculos
              ? `${a.veiculos.modelo} ${a.veiculos.placa}`
              : "—";
            const isUpdating = updatingId === a.id;
            const proximidade = STATUS_ATIVOS.has(a.status)
              ? calcularProximidade(a.data_hora)
              : "futuro";
            const proximidadeLabel = PROXIMIDADE_LABEL[proximidade];
            const destaque =
              proximidade === "atrasado" || proximidade === "agora"
                ? "border-orange-300 ring-1 ring-orange-200"
                : "border-slate-200";
            return (
              <div
                key={a.id}
                className={`rounded-xl border bg-white p-4 shadow-sm hover:shadow transition sm:p-5 ${destaque}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-slate-900">
                        {a.clientes?.nome ?? "—"}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                      {proximidadeLabel && (
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${PROXIMIDADE_COR[proximidade]}`}
                        >
                          {proximidadeLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Veículo:</span> {veiculoStr}
                    </p>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Serviço:</span>{" "}
                      {a.servicos?.nome ?? "—"}
                    </p>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Profissional:</span>{" "}
                      {a.profissionais?.nome ?? "—"}
                    </p>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium">Data/Hora:</span>{" "}
                      {formatDateTime(a.data_hora)}
                    </p>
                  </div>
                  <div className="flex flex-row flex-wrap gap-2 sm:flex-col">
                    {a.status === "pendente" && (
                      <>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(a.id, "confirmado")}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(a.id, "cancelado")}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {a.status === "confirmado" && (
                      <>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(a.id, "concluido")}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          Concluir
                        </button>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(a.id, "cancelado")}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {a.status === "concluido" && (
                      <span className="text-xs text-green-600 font-medium pt-1">
                        ✓ Concluído
                      </span>
                    )}
                    {a.status === "cancelado" && (
                      <span className="text-xs text-slate-500 font-medium pt-1">
                        ✕ Cancelado
                      </span>
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
