interface Servico {
  id: string;
  nome: string;
  descricao: string;
  duracao_minutos: number;
  preco: number;
}

const MOCK_SERVICOS: Servico[] = [
  { id: "1", nome: "Revisão Geral", descricao: "Revisão completa do veículo com checklist de 40 pontos", duracao_minutos: 120, preco: 350 },
  { id: "2", nome: "Troca de Óleo", descricao: "Troca de óleo do motor com filtro", duracao_minutos: 30, preco: 120 },
  { id: "3", nome: "Alinhamento e Balanceamento", descricao: "Alinhamento geométrico e balanceamento das 4 rodas", duracao_minutos: 60, preco: 180 },
  { id: "4", nome: "Freios", descricao: "Inspeção e troca de pastilhas e/ou disco de freio", duracao_minutos: 90, preco: 280 },
  { id: "5", nome: "Suspensão", descricao: "Diagnóstico e reparo do sistema de suspensão", duracao_minutos: 120, preco: 320 },
  { id: "6", nome: "Elétrica", descricao: "Diagnóstico e reparo no sistema elétrico e injeção eletrônica", duracao_minutos: 90, preco: 250 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function ServicosPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Serviços</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_SERVICOS.map((s) => (
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
            <p className="text-sm text-slate-600 mb-3">{s.descricao}</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>⏱</span>
              <span>{formatDuration(s.duracao_minutos)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
