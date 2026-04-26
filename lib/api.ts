/**
 * Cliente HTTP do frontend para os endpoints serverless em /api/*.
 *
 * Toda chamada à API passa por aqui. Vantagens:
 * - Tipos compartilhados entre páginas (uma única fonte da verdade)
 * - Tratamento uniforme de erro via ApiError (status + lista de mensagens)
 * - Fácil de mockar nos testes (basta interceptar fetch)
 */

// =====================================================================
// Tipos das entidades (espelham as tabelas do Supabase)
// =====================================================================

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  criado_em: string;
}

export interface ClienteCreate {
  nome: string;
  telefone: string;
  email?: string;
}

export interface Veiculo {
  id: string;
  cliente_id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number | null;
  /** Embedded resource via PostgREST */
  clientes?: { nome: string } | null;
}

export interface VeiculoCreate {
  cliente_id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano?: number;
}

export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  ativo: boolean;
}

export interface ProfissionalCreate {
  nome: string;
  especialidade: string;
  ativo?: boolean;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
}

export interface ServicoCreate {
  nome: string;
  descricao?: string;
  duracao_minutos: number;
  preco: number;
}

export type AgendamentoStatus =
  | "pendente"
  | "confirmado"
  | "concluido"
  | "cancelado";

export interface Agendamento {
  id: string;
  cliente_id: string;
  veiculo_id: string;
  profissional_id: string;
  servico_id: string;
  data_hora: string;
  status: AgendamentoStatus;
  observacoes: string | null;
  criado_em: string;
  /** Embedded via PostgREST */
  clientes?: { nome: string } | null;
  veiculos?: { placa: string; modelo: string } | null;
  profissionais?: { nome: string } | null;
  servicos?: {
    nome: string;
    duracao_minutos: number;
    preco: number;
  } | null;
}

export interface AgendamentoCreate {
  cliente_id: string;
  veiculo_id: string;
  profissional_id: string;
  servico_id: string;
  data_hora: string;
  observacoes?: string;
}

// =====================================================================
// Tratamento de erro
// =====================================================================

export class ApiError extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly errors: string[];
  readonly payload: unknown;

  constructor(status: number, message: string, errors: string[], payload: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.payload = payload;
  }
}

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch (e) {
    // Falha de rede ou bloqueio
    throw new ApiError(0, "Falha de rede", [String(e)], null);
  }

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const errors = extractErrors(body);
    const message =
      errors[0] ?? `Erro ${response.status} em ${url}`;
    throw new ApiError(response.status, message, errors, body);
  }

  return body as T;
}

function extractErrors(body: unknown): string[] {
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (Array.isArray(obj.errors)) return obj.errors.map(String);
    if (typeof obj.error === "string") return [obj.error];
    if (obj.error && typeof obj.error === "object") {
      const inner = obj.error as Record<string, unknown>;
      if (typeof inner.message === "string") return [inner.message];
    }
  }
  return [];
}

// =====================================================================
// Endpoints
// =====================================================================

export const api = {
  clientes: {
    listar: () => request<Cliente[]>("/api/clientes"),
    criar: (data: ClienteCreate) =>
      request<Cliente>("/api/clientes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    excluir: (id: string) =>
      request<{ ok: true }>(`/api/clientes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },

  veiculos: {
    listar: (opts?: { clienteId?: string }) => {
      const qs = opts?.clienteId
        ? `?cliente_id=${encodeURIComponent(opts.clienteId)}`
        : "";
      return request<Veiculo[]>(`/api/veiculos${qs}`);
    },
    criar: (data: VeiculoCreate) =>
      request<Veiculo>("/api/veiculos", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    excluir: (id: string) =>
      request<{ ok: true }>(`/api/veiculos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },

  profissionais: {
    listar: (opts?: { incluirInativos?: boolean }) => {
      const qs = opts?.incluirInativos ? "?incluir_inativos=1" : "";
      return request<Profissional[]>(`/api/profissionais${qs}`);
    },
    criar: (data: ProfissionalCreate) =>
      request<Profissional>("/api/profissionais", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  servicos: {
    listar: () => request<Servico[]>("/api/servicos"),
    criar: (data: ServicoCreate) =>
      request<Servico>("/api/servicos", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  agendamentos: {
    listar: () => request<Agendamento[]>("/api/agendamentos"),
    criar: (data: AgendamentoCreate) =>
      request<Agendamento>("/api/agendamentos", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    atualizarStatus: (id: string, status: AgendamentoStatus) =>
      request<Agendamento>(
        `/api/agendamentos?id=${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      ),
  },

  horariosDisponiveis: {
    listar: async (params: {
      profissionalId: string;
      servicoId: string;
      /** YYYY-MM-DD */
      data: string;
    }) => {
      const qs = new URLSearchParams({
        profissional_id: params.profissionalId,
        servico_id: params.servicoId,
        data: params.data,
      }).toString();
      const r = await request<{ horarios: string[] }>(
        `/api/horarios_disponiveis?${qs}`,
      );
      return r.horarios;
    },
  },
};
