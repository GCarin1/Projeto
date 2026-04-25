"use client";

import { useState } from "react";

interface Veiculo {
  id: string;
  cliente_id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
}

const MOCK_VEICULOS: Veiculo[] = [
  { id: "1", cliente_id: "1", placa: "ABC-1234", marca: "Volkswagen", modelo: "Gol", ano: 2020 },
  { id: "2", cliente_id: "1", placa: "DEF-5678", marca: "Chevrolet", modelo: "Onix", ano: 2022 },
  { id: "3", cliente_id: "2", placa: "GHI-9012", marca: "Ford", modelo: "Fiesta", ano: 2019 },
];

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>(MOCK_VEICULOS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ placa: "", marca: "", modelo: "", ano: "" });
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const novo: Veiculo = {
      id: String(Date.now()),
      cliente_id: "1",
      placa: form.placa.toUpperCase(),
      marca: form.marca,
      modelo: form.modelo,
      ano: parseInt(form.ano),
    };
    setVeiculos((prev) => [novo, ...prev]);
    setForm({ placa: "", marca: "", modelo: "", ano: "" });
    setShowForm(false);
    setSaving(false);
  }

  function handleDelete(id: string) {
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Veículos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          {showForm ? "Cancelar" : "+ Novo Veículo"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Placa</label>
              <input
                required
                value={form.placa}
                onChange={(e) => setForm((f) => ({ ...f, placa: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="ABC-1234"
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
                required
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

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Placa</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Marca</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Modelo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Ano</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {veiculos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhum veículo cadastrado.
                </td>
              </tr>
            ) : (
              veiculos.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{v.placa}</td>
                  <td className="px-4 py-3 text-slate-600">{v.marca}</td>
                  <td className="px-4 py-3 text-slate-600">{v.modelo}</td>
                  <td className="px-4 py-3 text-slate-600">{v.ano}</td>
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
