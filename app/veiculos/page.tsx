"use client";

import { useEffect, useState } from "react";
import { ApiError, api, type Cliente, type Veiculo } from "@/lib/api";
import { normalizarPlaca, validarPlaca } from "@/lib/validacao";

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[] | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    cliente_id: "",
    placa: "",
    marca: "",
    modelo: "",
    ano: "",
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  async function carregar() {
    try {
      setLoadError(null);
      const [vs, cs] = await Promise.all([
        api.veiculos.listar(),
        api.clientes.listar(),
      ]);
      setVeiculos(vs);
      setClientes(cs);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Erro ao carregar dados");
      setVeiculos([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const placa = normalizarPlaca(form.placa);
    const erroPlaca = validarPlaca(placa);
    if (erroPlaca) {
      setFormErrors([erroPlaca]);
      return;
    }
    setSaving(true);
    setFormErrors([]);
    try {
      await api.veiculos.criar({
        cliente_id: form.cliente_id,
        placa,
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        ano: form.ano ? parseInt(form.ano) : undefined,
      });
      setForm({ cliente_id: "", placa: "", marca: "", modelo: "", ano: "" });
      setShowForm(false);
      await carregar();
    } catch (e) {
      setFormErrors(
        e instanceof ApiError && e.errors.length > 0
          ? e.errors
          : [e instanceof Error ? e.message : "Erro inesperado"],
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este veículo?")) return;
    try {
      await api.veiculos.excluir(id);
      await carregar();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erro ao excluir.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Veículos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={clientes.length === 0}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-40"
          title={clientes.length === 0 ? "Cadastre um cliente antes" : ""}
        >
          {showForm ? "Cancelar" : "+ Novo Veículo"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Cliente</label>
              <select
                required
                value={form.cliente_id}
                onChange={(e) => setForm((f) => ({ ...f, cliente_id: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione o dono do veículo</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Placa</label>
              <input
                required
                value={form.placa}
                onChange={(e) => setForm((f) => ({ ...f, placa: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="ABC1234"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Marca</label>
              <input
                required
                value={form.marca}
                onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Volkswagen"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Modelo</label>
              <input
                required
                value={form.modelo}
                onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Gol"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ano</label>
              <input
                type="number"
                min="1900"
                max="2030"
                value={form.ano}
                onChange={(e) => setForm((f) => ({ ...f, ano: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="2020"
              />
            </div>
          </div>
          {formErrors.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <ul className="list-disc list-inside">
                {formErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Veículo"}
            </button>
          </div>
        </form>
      )}

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Placa</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Marca</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Modelo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Ano</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Dono</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {veiculos === null ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Carregando...
                </td>
              </tr>
            ) : veiculos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nenhum veículo cadastrado.
                </td>
              </tr>
            ) : (
              veiculos.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{v.placa}</td>
                  <td className="px-4 py-3 text-slate-600">{v.marca}</td>
                  <td className="px-4 py-3 text-slate-600">{v.modelo}</td>
                  <td className="px-4 py-3 text-slate-600">{v.ano ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{v.clientes?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
