interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  ativo: boolean;
}

const MOCK_PROFISSIONAIS: Profissional[] = [
  { id: "1", nome: "Ricardo Souza", especialidade: "Motor e Suspensão", ativo: true },
  { id: "2", nome: "Paulo Mendes", especialidade: "Freios e Direção", ativo: true },
  { id: "3", nome: "Fernanda Lima", especialidade: "Elétrica e Injeção", ativo: true },
  { id: "4", nome: "Carlos Nunes", especialidade: "Cambio e Transmissão", ativo: false },
];

export default function ProfissionaisPage() {
  const ativos = MOCK_PROFISSIONAIS.filter((p) => p.ativo);
  const inativos = MOCK_PROFISSIONAIS.filter((p) => !p.ativo);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Profissionais</h1>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-green-50 border-b border-green-100 px-4 py-2">
          <h2 className="text-sm font-semibold text-green-800">Disponíveis ({ativos.length})</h2>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {ativos.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500">Nenhum profissional disponível.</td>
              </tr>
            ) : (
              ativos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{p.nome}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.especialidade}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {inativos.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2">
            <h2 className="text-sm font-semibold text-slate-600">Inativos ({inativos.length})</h2>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {inativos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 text-slate-400">
                  <td className="px-4 py-3 font-medium">{p.nome}</td>
                  <td className="px-4 py-3">{p.especialidade}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      Inativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
