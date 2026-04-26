# V8 on Fire

Sistema de agendamento web para uma oficina mecânica. Clientes escolhem
serviço, profissional e horário disponível; a recepção gerencia a agenda
(confirmar / concluir / cancelar).

> 📚 **Estudando o projeto?** Há uma documentação didática em [`docs/`](./docs/README.md)
> explicando cada peça em linguagem acessível para quem está começando.

## Stack

| Camada       | Tecnologia                                |
|--------------|-------------------------------------------|
| Frontend     | Next.js 15 + TypeScript + Tailwind CSS    |
| Backend      | Funções serverless em Python (Vercel)     |
| Banco        | Supabase (PostgreSQL via PostgREST)       |
| Hospedagem   | Vercel                                    |
| Testes back  | pytest                                    |
| Testes front | Vitest + React Testing Library            |

## Pré-requisitos

- Node.js 18+
- Python 3.11+
- Conta gratuita no Supabase
- Conta gratuita na Vercel (opcional, para deploy)

## Como rodar localmente

```bash
# 1. Dependências do frontend
npm install

# 2. Dependências do backend (testes locais)
pip install -r requirements-dev.txt

# 3. Variáveis de ambiente
cp .env.local.example .env.local
# preencha SUPABASE_URL e SUPABASE_KEY (chave anon)

# 4. Dev server
npm run dev          # abre em http://localhost:3000
```

## Testes

```bash
npm test             # vitest (frontend)
pytest               # pytest (backend)
```

Status atual: **74 testes backend + 30 testes frontend** — todos verdes.

## Banco de dados (Supabase)

Para preparar o banco em um novo projeto Supabase:

1. Crie o projeto no [Supabase](https://supabase.com).
2. No SQL Editor, execute na ordem:
   - `db/migrations/001_init_schema.sql`
   - `db/seed/001_seed_profissionais_servicos.sql`
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public` key.
4. Configure essas variáveis na Vercel (Environment Variables) e em
   `.env.local` localmente.
5. Acesse `/api/db_health` no deploy para validar a conexão.

## Endpoints (resumo)

| Rota                           | Métodos             | Notas                                                              |
|--------------------------------|---------------------|--------------------------------------------------------------------|
| `/api/health`                  | GET                 | Health do serviço                                                  |
| `/api/db_health`               | GET                 | Verifica conexão com o Supabase                                    |
| `/api/clientes`                | GET / POST / DELETE | Lista, cria e exclui                                               |
| `/api/veiculos`                | GET / POST / DELETE | GET aceita `?cliente_id=`                                          |
| `/api/profissionais`           | GET / POST          | `?incluir_inativos=1` traz todos                                   |
| `/api/servicos`                | GET / POST          | Ordena por nome                                                    |
| `/api/agendamentos`            | GET / POST / PATCH  | POST valida conflito (409); PATCH `?id=` atualiza só o status      |
| `/api/horarios_disponiveis`    | GET                 | Query: `profissional_id`, `servico_id`, `data` (YYYY-MM-DD)        |

## Deploy na Vercel

O repositório já está conectado à Vercel. Cada push na `main` dispara um
deploy. Configure as variáveis `SUPABASE_URL` e `SUPABASE_KEY` no painel.

## Estrutura do projeto

```
projeto/
├── app/                  Next.js App Router (UI)
│   ├── _components/      Navbar e outros componentes cliente
│   ├── agendamentos/
│   ├── clientes/
│   ├── profissionais/
│   ├── servicos/
│   └── veiculos/
├── api/                  Funções Python serverless
│   └── _lib/             db.py, http_utils.py, validators.py, crud.py
├── lib/                  Helpers compartilhados do frontend
│   ├── api.ts            Cliente HTTP tipado
│   ├── proximidade.ts    Badge "Hoje / Amanhã / Atrasado"
│   └── validacao.ts      Validação de placa e telefone
├── db/
│   ├── migrations/       SQL de criação do schema
│   └── seed/             Dados iniciais (profissionais, serviços)
├── tests/
│   ├── api/              pytest
│   └── frontend/         vitest
├── docs/                 Documentação didática (ler isso primeiro!)
├── contexto.md           Memória de longo prazo do projeto
└── vercel.json           Runtime Python para /api/*.py
```

## Documentação adicional

- [`contexto.md`](./contexto.md) — memória de longo prazo: decisões, etapas, histórico
- [`docs/`](./docs/README.md) — guia de estudo, explicações didáticas
