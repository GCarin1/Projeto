/**
 * Calcula a "proximidade" de um agendamento em relação a um instante de
 * referência (default = agora). Usamos isso para destacar visualmente
 * agendamentos próximos na agenda.
 *
 * Regras (decididas na Etapa 5):
 * - "atrasado": data_hora já passou e o agendamento ainda está em aberto.
 * - "agora":   está acontecendo dentro de 1h pra trás ou 1h pra frente.
 * - "hoje":    no mesmo dia civil (após o "agora").
 * - "amanha":  no dia civil seguinte.
 * - "futuro":  qualquer coisa depois.
 *
 * O dia civil é calculado no fuso local do navegador para que "Hoje" combine
 * com o que o usuário vê no calendário.
 */

export type Proximidade =
  | "atrasado"
  | "agora"
  | "hoje"
  | "amanha"
  | "futuro";

const UMA_HORA_MS = 60 * 60 * 1000;

function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function calcularProximidade(
  dataHoraIso: string,
  agora: Date = new Date(),
): Proximidade {
  const dt = new Date(dataHoraIso);
  const diff = dt.getTime() - agora.getTime();

  if (diff < -UMA_HORA_MS) return "atrasado";
  if (Math.abs(diff) <= UMA_HORA_MS) return "agora";
  if (mesmoDia(dt, agora)) return "hoje";

  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);
  if (mesmoDia(dt, amanha)) return "amanha";

  return "futuro";
}

export const PROXIMIDADE_LABEL: Record<Proximidade, string> = {
  atrasado: "Atrasado",
  agora: "Agora",
  hoje: "Hoje",
  amanha: "Amanhã",
  futuro: "",
};

export const PROXIMIDADE_COR: Record<Proximidade, string> = {
  atrasado: "bg-red-100 text-red-800 border-red-200",
  agora: "bg-orange-100 text-orange-800 border-orange-200",
  hoje: "bg-amber-100 text-amber-800 border-amber-200",
  amanha: "bg-sky-100 text-sky-800 border-sky-200",
  futuro: "",
};
