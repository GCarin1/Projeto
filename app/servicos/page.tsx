"use client";

import { useEffect, useState } from "react";
import { ApiError, api, type Servico } from "@/lib/api";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadError(null);
        setServicos(await api.servicos.listar());
      } catch (e) {
        setLoadError(
          e instanceof ApiError ? e.message : "Erro ao carregar serviços",
        );
        setServicos([]);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Serviços</h1>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {servicos === null ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Carregando...
        </div>
      ) : servicos.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Nenhum serviço cadastrado.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900">{s.nome}</h3>
                <span className="text-sm font-bold text-orange-600 whitespace-nowrap">
                  {formatCurrency(s.preco)}
                </span>
              </div>
              {s.descricao && (
                <p className="text-sm text-slate-600 mb-3">{s.descricao}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>⏱</span>
                <span>{formatDuration(s.duracao_minutos)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
