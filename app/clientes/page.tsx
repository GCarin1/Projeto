"use client";

import { useState } from "react";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  criado_em: string;
}

const MOCK_CLIENTES: Cliente[] = [
  { id: "1", nome: "João Silva", telefone: "(11) 99999-0001", email: "joao@email.com", criado_em: "2026-04-01" },
  { id: "2", nome: "Maria Santos", telefone: "(11) 99999-0002", email: "maria@email.com", criado_em: "2026-04-10" },
  { id: "3", nome: "Carlos Oliveira", telefone: "(11) 99999-0003", email: "carlos@email.com", criado_em: "2026-04-15" },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(MOCK_CLIENTES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "" });
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const novo: Cliente = {
      id: String(Date.now()),
      nome: form.nome,
      telefone: form.telefone,
      email: form.email,
      criado_em: new Date().toISOString().split("T")[0],
    };
    setClientes((prev) => [novo, ...prev]);
    setForm({ nome: "", telefone: "", email: "" });
    setShowForm(false);
    setSaving(false);
  }

  function handleDelete(id: string) {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          {showForm ? "Cancelar" : "+ Novo Cliente"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Telefone</label>
              <input
                required
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="(11) 99999-0000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Cliente"}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Telefone</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">E-mail</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Desde</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{cliente.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{cliente.telefone}</td>
                  <td className="px-4 py-3 text-slate-600">{cliente.email}</td>
                  <td className="px-4 py-3 text-slate-500">{cliente.criado_em}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(cliente.id)}
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
