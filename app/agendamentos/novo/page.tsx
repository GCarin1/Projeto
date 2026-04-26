"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  api,
  type Cliente,
  type Profissional,
  type Servico,
  type Veiculo,
} from "@/lib/api";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Recorta apenas a hora HH:mm de um ISO 8601 (mostra no horário do navegador). */
function horaDoIso(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loadingVeiculos, setLoadingVeiculos] = useState(false);

  const [horarios, setHorarios] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [horariosError, setHorariosError] = useState<string | null>(null);

  const [form, setForm] = useState({
    cliente_id: "",
    veiculo_id: "",
    servico_id: "",
    profissional_id: "",
    data: "",
    horarioIso: "", // ISO completo escolhido entre os disponíveis
  });

  // Carga inicial dos selects
  useEffect(() => {
    (async () => {
      try {
        const [cs, ps, ss] = await Promise.all([
          api.clientes.listar(),
          api.profissionais.listar(),
          api.servicos.listar(),
        ]);
        setClientes(cs);
        setProfissionais(ps);
        setServicos(ss);
      } catch (e) {
        setLoadError(
          e instanceof ApiError ? e.message : "Erro ao carregar dados",
        );
      }
    })();
  }, []);

  // Quando o cliente muda, busca os veículos dele
  useEffect(() => {
    if (!form.cliente_id) {
      setVeiculos([]);
      setForm((f) => ({ ...f, veiculo_id: "" }));
      return;
    }
    setLoadingVeiculos(true);
    api.veiculos
      .listar({ clienteId: form.cliente_id })
      .then((vs) => {
        setVeiculos(vs);
        setForm((f) => ({ ...f, veiculo_id: "" }));
      })
      .catch(() => setVeiculos([]))
      .finally(() => setLoadingVeiculos(false));
  }, [form.cliente_id]);

  // Quando profissional + serviço + data estão escolhidos, busca horários
  useEffect(() => {
    if (!form.profissional_id || !form.servico_id || !form.data) {
      setHorarios([]);
      setForm((f) => ({ ...f, horarioIso: "" }));
      return;
    }
    setLoadingHorarios(true);
    setHorariosError(null);
    setForm((f) => ({ ...f, horarioIso: "" }));
    api.horariosDisponiveis
      .listar({
        profissionalId: form.profissional_id,
        servicoId: form.servico_id,
        data: form.data,
      })
      .then((hs) => setHorarios(hs))
      .catch((e) => {
        setHorarios([]);
        setHorariosError(
          e instanceof ApiError ? e.message : "Erro ao buscar horários",
        );
      })
      .finally(() => setLoadingHorarios(false));
  }, [form.profissional_id, form.servico_id, form.data]);

  const servico = useMemo(
    () => servicos.find((s) => s.id === form.servico_id),
    [servicos, form.servico_id],
  );
  const profissional = useMemo(
    () => profissionais.find((p) => p.id === form.profissional_id),
    [profissionais, form.profissional_id],
  );
  const cliente = useMemo(
    () => clientes.find((c) => c.id === form.cliente_id),
    [clientes, form.cliente_id],
  );

  const isStep1Valid = !!(form.cliente_id && form.veiculo_id && form.servico_id);
  const isStep2Valid = !!(
    form.profissional_id &&
    form.data &&
    form.horarioIso
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isStep2Valid) return;
    setSaving(true);
    setSubmitErrors([]);
    try {
      await api.agendamentos.criar({
        cliente_id: form.cliente_id,
        veiculo_id: form.veiculo_id,
        servico_id: form.servico_id,
        profissional_id: form.profissional_id,
        data_hora: form.horarioIso,
      });
      router.push("/agendamentos");
    } catch (e) {
      if (e instanceof ApiError) {
        setSubmitErrors(e.errors.length > 0 ? e.errors : [e.message]);
      } else {
        setSubmitErrors(["Erro inesperado ao salvar."]);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Novo Agendamento</h1>
      <p className="text-slate-600 mb-8">Siga os passos para agendar um serviço.</p>

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="flex items-center gap-2 mb-8">
        <Step number={1} label="Cliente, Veículo e Serviço" active={step >= 1} done={step > 1} />
        <div className="flex-1 h-px bg-slate-200" />
        <Step number={2} label="Profissional e Horário" active={step >= 2} done={false} />
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Passo 1 — Cliente, Veículo e Serviço
            </h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cliente</label>
              <select
                required
                value={form.cliente_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cliente_id: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Veículo</label>
              <select
                required
                disabled={!form.cliente_id || loadingVeiculos}
                value={form.veiculo_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, veiculo_id: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {!form.cliente_id
                    ? "Selecione um cliente primeiro"
                    : loadingVeiculos
                    ? "Carregando..."
                    : veiculos.length === 0
                    ? "Cliente sem veículos cadastrados"
                    : "Selecione o veículo"}
                </option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.modelo} — {v.placa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Serviço</label>
              <select
                required
                value={form.servico_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, servico_id: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione um serviço</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} — {formatCurrency(s.preco)}
                  </option>
                ))}
              </select>
            </div>

            {servico && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm">
                <p>
                  <span className="font-medium text-slate-700">Duração estimada:</span>{" "}
                  {servico.duracao_minutos} minutos
                </p>
                <p>
                  <span className="font-medium text-slate-700">Valor:</span>{" "}
                  {formatCurrency(servico.preco)}
                </p>
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
            <h2 className="text-lg font-semibold text-slate-900">
              Passo 2 — Profissional e Horário
            </h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Profissional</label>
              <select
                required
                value={form.profissional_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, profissional_id: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione um profissional</option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {p.especialidade}
                  </option>
                ))}
              </select>
            </div>

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
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Horário disponível
              </label>
              {!form.profissional_id || !form.data ? (
                <p className="text-sm text-slate-500">
                  Escolha um profissional e uma data para ver os horários.
                </p>
              ) : loadingHorarios ? (
                <p className="text-sm text-slate-500">Buscando horários...</p>
              ) : horariosError ? (
                <p className="text-sm text-red-700">{horariosError}</p>
              ) : horarios.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum horário disponível neste dia para este profissional.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {horarios.map((h) => {
                    const selected = form.horarioIso === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, horarioIso: h }))}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          selected
                            ? "border-orange-600 bg-orange-600 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-orange-400"
                        }`}
                      >
                        {horaDoIso(h)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {servico && profissional && cliente && form.horarioIso && (
              <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 text-sm">
                <p className="font-medium text-orange-900">Resumo do agendamento:</p>
                <p className="text-orange-700">Cliente: {cliente.nome}</p>
                <p className="text-orange-700">
                  Veículo:{" "}
                  {veiculos.find((v) => v.id === form.veiculo_id)?.modelo}{" "}
                  {veiculos.find((v) => v.id === form.veiculo_id)?.placa}
                </p>
                <p className="text-orange-700">Serviço: {servico.nome}</p>
                <p className="text-orange-700">Profissional: {profissional.nome}</p>
                <p className="text-orange-700">
                  Data/Hora:{" "}
                  {new Date(form.horarioIso).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {submitErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <ul className="list-disc list-inside">
                  {submitErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
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

function Step({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        active ? "text-orange-600" : "text-slate-400"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border-2
        ${
          done
            ? "bg-orange-600 border-orange-600 text-white"
            : active
            ? "border-orange-600 text-orange-600"
            : "border-slate-300 text-slate-400"
        }`}
      >
        {done ? "✓" : number}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
