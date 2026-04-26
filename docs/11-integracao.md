# 11. Integração: Frontend ↔ Backend ↔ Banco

> 🧭 Capítulo extra.
> ← [10. Glossário](./10-glossario.md) | [↑ Voltar ao sumário](./README.md)

Este capítulo é um **mergulho técnico** em como as três camadas do
sistema conversam entre si. Os capítulos [3](./03-arquitetura.md) e
[7](./07-fluxo-agendamento.md) deram a visão geral; aqui você vai
**ver o código** de cada ponte, com nomes de arquivos e linhas.

```
┌────────────────┐    HTTP/JSON     ┌─────────────────┐    HTTP/PostgREST    ┌──────────────┐
│   FRONTEND     │ ───────────────▶ │     BACKEND     │ ───────────────────▶ │    BANCO     │
│  (Next.js/TS)  │ ◀─────────────── │  (Python serv.) │ ◀─────────────────── │  (Supabase)  │
└────────────────┘                  └─────────────────┘                      └──────────────┘
     lib/api.ts                       api/_lib/db.py                          PostgreSQL
                                      api/<rota>.py
```

Toda comunicação entre camadas é **HTTP + JSON**. Sem RPC binário, sem
WebSocket, sem ORM gigante. Isso simplifica testes, monitoramento e
debug.

---

## Parte 1 — Frontend ↔ Backend

### 1.1. Por que tudo passa por `lib/api.ts`?

Em vez de fazer `fetch()` espalhado em cada página, **toda chamada à
API passa por uma função única**:

```ts
// lib/api.ts
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch (e) {
    throw new ApiError(0, "Falha de rede", [String(e)], null);
  }

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }

  if (!response.ok) {
    const errors = extractErrors(body);
    const message = errors[0] ?? `Erro ${response.status} em ${url}`;
    throw new ApiError(response.status, message, errors, body);
  }

  return body as T;
}
```

Vantagens:

- **Tipagem ponta a ponta.** `request<Cliente[]>` retorna um array
  tipado; o TypeScript reclama se você usar errado.
- **Erro uniforme.** Qualquer falha vira `ApiError` com `status`,
  `message`, `errors[]` e `payload`.
- **Mock simples em testes.** Os testes (`tests/frontend/api.test.ts`)
  só interceptam `fetch`.

### 1.2. O catálogo de endpoints

Tudo que o frontend precisa está em um único objeto exportado:

```ts
export const api = {
  clientes: {
    listar: () => request<Cliente[]>("/api/clientes"),
    criar:  (data) => request<Cliente>("/api/clientes", {
      method: "POST", body: JSON.stringify(data),
    }),
    excluir: (id) => request(`/api/clientes?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  },
  agendamentos: {
    listar: () => request<Agendamento[]>("/api/agendamentos"),
    criar:  (data) => request<Agendamento>("/api/agendamentos", { ... }),
    atualizarStatus: (id, status) => request(
      `/api/agendamentos?id=${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify({ status }) },
    ),
  },
  horariosDisponiveis: {
    listar: async ({ profissionalId, servicoId, data }) => {
      const qs = new URLSearchParams({
        profissional_id: profissionalId,
        servico_id: servicoId,
        data,
      }).toString();
      const r = await request<{ horarios: string[] }>(
        `/api/horarios_disponiveis?${qs}`,
      );
      return r.horarios;
    },
  },
  // veiculos, profissionais, servicos...
};
```

Quando uma rota mudar, atualizamos **um lugar só**.

### 1.3. Tipos compartilhados

Cada entidade do banco vira uma interface TypeScript:

```ts
// lib/api.ts
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  criado_em: string;
}

export type AgendamentoStatus =
  | "pendente" | "confirmado" | "concluido" | "cancelado";

export interface Agendamento {
  id: string;
  cliente_id: string;
  data_hora: string;
  status: AgendamentoStatus;
  // recursos embutidos via PostgREST:
  clientes?: { nome: string } | null;
  veiculos?: { placa: string; modelo: string } | null;
  profissionais?: { nome: string } | null;
  servicos?: { nome: string; duracao_minutos: number; preco: number } | null;
}
```

> 💡 Os campos `clientes`, `veiculos` etc. dentro de `Agendamento` são
> **embeddings**: o PostgREST traz o relacionamento já junto, sem
> precisar de um segundo request. Mais sobre isso na parte 2.

### 1.4. Como cada página usa

```tsx
// app/clientes/page.tsx
"use client";
import { useEffect, useState } from "react";
import { ApiError, api, type Cliente } from "@/lib/api";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    api.clientes.listar()
      .then(setClientes)
      .catch((e) =>
        setLoadError(e instanceof ApiError ? e.message : "Erro ao carregar"),
      );
  }, []);

  // ... renderiza loading / erro / lista
}
```

O ciclo é sempre:

1. Montou o componente → dispara `api.X.Y()`.
2. Sucesso → `setEstado(dados)`.
3. Falha → captura `ApiError` e mostra mensagem.

### 1.5. Por que não tem CORS?

O frontend e o backend rodam **no mesmo domínio** (Vercel). O navegador
trata `https://meusite.vercel.app/agendamentos` (página) e
`https://meusite.vercel.app/api/agendamentos` (endpoint) como mesma
origem. Zero configuração de CORS. Em dev, o `next dev` faz o mesmo
proxying.

### 1.6. Status codes — o vocabulário compartilhado

| Status | Quando o backend devolve                               | Como o frontend reage             |
|--------|--------------------------------------------------------|-----------------------------------|
| `200`  | GET / PATCH bem-sucedido                                | Atualiza estado com `body`        |
| `201`  | POST criou recurso                                      | Idem, e geralmente redireciona    |
| `400`  | JSON inválido (body malformado)                         | Mostra "erro inesperado"          |
| `404`  | Recurso não encontrado (ex.: `servico_id` não existe)   | Mensagem específica               |
| `405`  | Método não suportado naquela rota                       | Não deveria acontecer (bug nosso) |
| `409`  | **Conflito de horário** (com `conflito_com`)            | Mensagem em vermelho              |
| `422`  | `ValidationError` — payload inválido                    | Lista os erros campo a campo      |
| `503`  | Banco indisponível ou env vars faltando                 | "Tente novamente em instantes"    |

A página captura, desempacota `e.errors[]` e mostra:

```tsx
if (e instanceof ApiError) {
  setFormErrors(e.errors.length > 0 ? e.errors : [e.message]);
}
```

---

## Parte 2 — Backend ↔ Banco

### 2.1. O cliente do Supabase em `api/_lib/db.py`

Em vez do SDK oficial (`supabase-py`), usamos `httpx` direto contra o
**PostgREST** (a API REST que o Supabase expõe):

```python
# api/_lib/db.py
import os, httpx

_client: httpx.Client | None = None

class MissingSupabaseConfigError(RuntimeError):
    """Sobe quando SUPABASE_URL ou SUPABASE_KEY não estão configuradas."""

def get_client() -> httpx.Client:
    global _client
    if _client is not None:
        return _client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise MissingSupabaseConfigError(
            "Defina SUPABASE_URL e SUPABASE_KEY no ambiente",
        )

    _client = httpx.Client(
        base_url=f"{url.rstrip('/')}/rest/v1",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",  # devolve a linha após INSERT
        },
        timeout=10.0,
    )
    return _client
```

Pontos importantes:

- **Cache em variável global.** Cada invocação da função serverless
  reaproveita o cliente HTTP enquanto o processo viver — economiza
  conexões.
- **Variáveis de ambiente.** Nada de chave hardcoded. A Vercel injeta;
  localmente você define em `.env.local`.
- **`Prefer: return=representation`.** Faz o PostgREST devolver a linha
  inserida. Sem isso, INSERT volta vazio.

> ⚠️ Se as env vars sumirem, o `get_client()` levanta
> `MissingSupabaseConfigError`. O `crud.py` traduz isso em **HTTP 503**.

### 2.2. PostgREST — falando com o banco via REST

A documentação completa está em [postgrest.org](https://postgrest.org).
Os padrões que usamos:

#### 2.2.1. Listar com ordenação e filtro

```python
# api/clientes.py — listar
client.get("/clientes", params={"order": "criado_em.desc"})
```

```python
# api/veiculos.py — listar com filtro por cliente
client.get("/veiculos", params={
    "select": "*,clientes(nome)",        # embutir nome do cliente
    "cliente_id": f"eq.{cliente_id}",    # WHERE cliente_id = ...
})
```

A sintaxe do PostgREST: **operador**.**valor** (`eq.123`, `neq.cancelado`,
`gt.10`, `lt.20`, `like.*algo*`).

#### 2.2.2. Criar com retorno

```python
client.post("/clientes", json={"nome": "Ana", "telefone": "11999"})
# Como o header Prefer=return=representation está na config do client,
# resp.json() devolve a linha criada (com id e criado_em).
```

#### 2.2.3. Atualizar parcial (PATCH)

```python
client.patch(
    "/agendamentos",
    params={"id": f"eq.{ag_id}"},
    json={"status": "confirmado"},
)
```

#### 2.2.4. Excluir

```python
client.delete("/clientes", params={"id": f"eq.{cliente_id}"})
```

### 2.3. Embeddings — o segredo do PostgREST

Esta consulta:

```python
client.get("/agendamentos", params={
    "select": "*,clientes(nome),veiculos(placa,modelo),"
              "profissionais(nome),"
              "servicos(nome,duracao_minutos,preco)",
    "order": "data_hora.asc",
})
```

Devolve cada agendamento **com os relacionados embutidos**:

```json
[{
  "id": "...",
  "cliente_id": "...",
  "data_hora": "2026-05-05T10:00:00+00:00",
  "status": "pendente",
  "clientes":      { "nome": "Mariana" },
  "veiculos":      { "placa": "ABC1D23", "modelo": "Gol" },
  "profissionais": { "nome": "João" },
  "servicos":      { "nome": "Revisão", "duracao_minutos": 90, "preco": 350 }
}]
```

Sem isso, precisaríamos fazer **N+1 requisições** (uma por agendamento
para buscar cada detalhe). Embedding faz tudo em **uma só** consulta —
o PostgREST traduz para um JOIN no PostgreSQL.

### 2.4. O fluxo de criação de agendamento (3 chamadas ao banco)

`api/agendamentos.py → _criar_agendamento`:

```python
# 1) Buscar a duração do serviço escolhido
resp = client.get("/servicos", params={
    "select": "duracao_minutos",
    "id": f"eq.{data['servico_id']}",
    "limit": "1",
})
duracao = int(resp.json()[0]["duracao_minutos"])

# 2) Buscar agendamentos existentes do mesmo profissional (não cancelados)
resp = client.get("/agendamentos", params={
    "select": "id,data_hora,servicos(duracao_minutos)",
    "profissional_id": f"eq.{data['profissional_id']}",
    "status": "neq.cancelado",
})
existentes = resp.json()

# 3) Detectar conflito (função pura, sem rede)
conflito = detectar_conflito(_parse_iso(data["data_hora"]), duracao, existentes)
if conflito is not None:
    write_json(handler, 409, {
        "ok": False,
        "error": "conflito de horário com outro agendamento do profissional",
        "conflito_com": conflito["id"],
    })
    return

# 4) INSERT
resp = client.post("/agendamentos", json=data)
write_json(handler, 201, resp.json()[0])
```

Cada `client.X(...)` é um HTTP para o Supabase. Cada um pode levantar
`httpx.HTTPStatusError`, capturado pelo `try/except` que vira HTTP 503
ou um erro estruturado para o frontend.

### 2.5. Tratamento centralizado de erro do banco

`api/_lib/crud.py` tem a função `_write_db_error(handler, exc)`. Ela
identifica o tipo da exceção e devolve a resposta certa:

```python
def _write_db_error(handler, exc):
    if isinstance(exc, MissingSupabaseConfigError):
        write_json(handler, 503, {"ok": False, "error": str(exc)})
        return
    if isinstance(exc, httpx.HTTPStatusError):
        # erro veio do Supabase — passa o status original
        write_json(handler, exc.response.status_code, {
            "ok": False, "error": exc.response.text,
        })
        return
    # erro inesperado → 500
    write_json(handler, 500, {"ok": False, "error": str(exc)})
```

Por isso os endpoints CRUD ficam tão limpos: a parte chata de
classificar erro do Supabase está em um único lugar.

---

## Parte 3 — Configuração que liga as três camadas

### 3.1. As variáveis de ambiente

| Variável         | Onde se usa                | Onde se define                       |
|------------------|----------------------------|--------------------------------------|
| `SUPABASE_URL`   | `api/_lib/db.py`           | `.env.local` (dev) + Vercel (prod)  |
| `SUPABASE_KEY`   | `api/_lib/db.py`           | `.env.local` (dev) + Vercel (prod)  |

Em produção, na **Vercel → Project Settings → Environment Variables**:
adicione as duas e **faça redeploy** (variáveis novas só valem em
deploys posteriores).

### 3.2. Como a Vercel sabe que `/api/*.py` é Python

Pelo `vercel.json`:

```json
{
  "framework": "nextjs",
  "functions": {
    "api/**/*.py": { "runtime": "@vercel/python@4.3.0" }
  }
}
```

Esse é o **único pedaço de configuração** que une os dois mundos. Sem
isso, a Vercel trataria os `.py` como arquivos estáticos.

Resultado: ela compila o Next.js normalmente para o frontend, e cada
arquivo Python vira uma **função serverless independente**.

### 3.3. Roteamento no mesmo domínio

```
https://meusite.vercel.app/                 → Next.js (estático)
https://meusite.vercel.app/agendamentos     → Next.js (estático)
https://meusite.vercel.app/api/agendamentos → Python (api/agendamentos.py)
https://meusite.vercel.app/api/db_health    → Python (api/db_health.py)
```

A Vercel decide para onde mandar com base na rota: tudo em `/api/*` vai
para Python; o resto vai para o Next.js.

---

## Parte 4 — Como visualizar a integração inteira

### 4.1. Listagem de agendamentos

```
NAVEGADOR                     VERCEL                       SUPABASE
├─ GET /agendamentos            (Next.js renderiza HTML)
│   (ainda sem dados)           
│   <Página dispara fetch>     
├─ GET /api/agendamentos ────▶ api/agendamentos.py
│                              ├─ handle_list("agendamentos", ...)
│                              ├─ get_client()
│                              ├─ GET .../rest/v1/agendamentos?select=*,clientes(nome)... ─▶
│                              │                                                              SELECT a.*, c.nome ...
│                              │                                                              FROM agendamentos a
│                              │                                                              LEFT JOIN clientes c ...
│                              │ ◀──── JSON com embeddings ─────────────────────────────────
│                              └─ devolve JSON
│ ◀──── JSON ──────────────────
│   <setAgendamentos(...)>
│   <renderiza linhas + badges>
```

### 4.2. Criação de agendamento (com checagem de conflito)

```
NAVEGADOR              VERCEL (Python)                 SUPABASE
├─ POST /api/agendamentos
│  body: { cliente_id, servico_id, profissional_id, data_hora, ... }
│           │
│           ▼
│      validate_agendamento(payload)  ← falha → 422
│           │
│           ├─ GET /servicos?id=eq.X       ─▶  duracao_minutos
│           ├─ GET /agendamentos?profissional_id=eq.Y&status=neq.cancelado  ─▶
│           │                                  lista existentes (com embedding)
│           ├─ detectar_conflito(...)      ← se conflita → 409 + conflito_com
│           └─ POST /agendamentos          ─▶ INSERT
│                                              ◀── linha gravada ──
│ ◀──── 201 + linha completa ─────
│  router.push("/agendamentos")
```

---

## Onde os contratos vivem

| Contrato                                | Quem usa                                                | Onde está                     |
|-----------------------------------------|--------------------------------------------------------|-------------------------------|
| Schema das tabelas                      | Backend, banco                                         | `db/migrations/001_init_schema.sql` |
| Validação de payload (regras de negócio) | Backend                                              | `api/_lib/validators.py`     |
| Tipos das entidades (TS)                | Frontend                                               | `lib/api.ts`                  |
| Catálogo de endpoints (TS)              | Frontend                                               | `lib/api.ts`                  |
| Mapa de status HTTP → mensagem          | Frontend (`ApiError`) e backend (`crud.py`)           | os dois respeitam a mesma tabela |

Quando algo muda em uma camada, você atualiza **o contrato** e as duas
pontas. Como a maior parte do código respeita os contratos via
`api/_lib/crud.py` e `lib/api.ts`, a mudança fica concentrada.

---

## Princípios desta integração

1. **JSON em todo lugar.** Cada camada fala HTTP+JSON. Sem mistério.
2. **Tipos no frontend, validação no backend, constraints no banco.**
   Cada camada protege a próxima. Falha em uma não deixa cair as outras.
3. **Funções puras nas decisões críticas.** `detectar_conflito` e
   `calcularProximidade` não tocam rede — são fáceis de testar.
4. **Um arquivo, uma rota.** Tanto no Next.js (`app/X/page.tsx`) quanto
   no backend (`api/X.py`). Convenção mata configuração.
5. **PostgREST em vez de SDK pesado.** O Supabase é só uma URL — não
   precisamos casar com o SDK deles. Se um dia trocarmos para outro
   PostgREST (ou um servidor próprio), só `db.py` muda.

---

## Para experimentar

Tente os seguintes ajustes para sentir a integração de perto:

1. **Adicionar campo `cor` em `veiculos`.** Migration → backend
   (validator) → frontend (interface + form) → ver na tabela.
2. **Permitir excluir um agendamento.** `do_DELETE` em
   `api/agendamentos.py` + `api.agendamentos.excluir` em `lib/api.ts` +
   botão na agenda.
3. **Filtrar agendamentos por status.** Query param no GET, `eq.X` no
   PostgREST, dropdown na UI.

Cada exercício te leva pelas três camadas. É o melhor jeito de fixar.

---

[↑ Voltar ao sumário](./README.md)
