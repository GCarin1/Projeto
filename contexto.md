# Contexto do Projeto — V8 on Fire

> Este arquivo serve como **memória de longo prazo** do projeto. Toda decisão importante, etapa concluída e pendência devem ser registradas aqui para que qualquer pessoa (ou sessão futura do Claude) consiga continuar o trabalho sem perder contexto.

---

## 1. Visão geral

Sistema de **agendamento web para uma oficina mecânica**, parte do projeto V8 on Fire (TAP do primeiro semestre).

**Objetivo:** permitir que clientes agendem orçamentos e serviços de manutenção em horários disponíveis, escolhendo o tipo de serviço, o profissional e o horário entre as opções livres.

**Princípios de desenvolvimento:**
- ✅ Simples e funcional acima de tudo
- ✅ TDD (testes antes do código de produção)
- ✅ Checklist por etapa
- ✅ Priorizar funcionalidades de alta/média prioridade da TAP
- ❌ Sem login nesta primeira versão
- ❌ Notificações ficam para o final

---

## 2. Stack & decisões técnicas

| Camada | Escolha | Motivo |
|---|---|---|
| Frontend | **Next.js + TypeScript + Tailwind CSS** | Padrão moderno, integra nativamente com Vercel |
| Backend | **Python serverless** (em `/api/*.py`) | Mantém o Python do plano original da TAP, roda como funções serverless na Vercel |
| Banco | **Supabase (PostgreSQL)** via REST | Plano gratuito, sem servidor para gerenciar. Usamos `httpx` para falar direto com o PostgREST (mais leve que o SDK) |
| Hospedagem | **Vercel** | Já linkada ao repo `gcarin1/projeto` |
| Testes (back) | **pytest** | Padrão Python |
| Testes (front) | **Vitest** + React Testing Library | Mais rápido que Jest, padrão moderno |
| Repositório | `gcarin1/projeto` | |
| Branch de trabalho | `claude/setup-vercel-deployment-ulDHC` | |

---

## 3. Modelagem do banco (DER)

```
clientes
  - id (pk)
  - nome
  - telefone
  - email
  - criado_em

veiculos
  - id (pk)
  - cliente_id (fk → clientes.id)
  - placa
  - marca
  - modelo
  - ano

profissionais
  - id (pk)
  - nome
  - especialidade
  - ativo (bool)

servicos
  - id (pk)
  - nome
  - descricao
  - duracao_minutos
  - preco

agendamentos
  - id (pk)
  - cliente_id (fk)
  - veiculo_id (fk)
  - profissional_id (fk)
  - servico_id (fk)
  - data_hora (timestamp)
  - status (pendente | confirmado | concluido | cancelado)
  - observacoes
  - criado_em
```

**Regra de conflito:** um profissional não pode ter dois agendamentos cuja janela `[data_hora, data_hora + servico.duracao_minutos]` se sobreponha.

---

## 4. Estrutura de pastas (alvo)

```
projeto/
├── app/                      # Next.js App Router (frontend)
│   ├── page.tsx
│   ├── layout.tsx
│   ├── clientes/
│   ├── veiculos/
│   ├── profissionais/
│   ├── servicos/
│   └── agendamentos/
├── api/                      # Python serverless (Vercel Python runtime)
│   ├── health.py
│   ├── clientes.py
│   ├── veiculos.py
│   ├── profissionais.py
│   ├── servicos.py
│   ├── agendamentos.py
│   ├── horarios_disponiveis.py
│   └── _lib/
│       ├── db.py             # cliente Supabase
│       └── schemas.py        # validação (pydantic)
├── tests/
│   ├── api/                  # pytest
│   └── frontend/             # vitest
├── package.json
├── requirements.txt
├── vercel.json
├── .env.local.example
└── contexto.md
```

---

## 5. Etapas do projeto

### Etapa 0 — Setup & Decisões ✅
- [x] Ler `Prompt.md`
- [x] Definir stack (Next.js + Python + Supabase)
- [x] Escolher repositório e branch
- [x] Definir modelagem do banco
- [x] Criar `contexto.md`

### Etapa 1 — Fundação do projeto ✅
- [x] `package.json` com Next.js + TypeScript + Tailwind
- [x] Estrutura `app/` com página inicial mínima
- [x] `vercel.json` configurando runtime Python para `/api/*.py`
- [x] `requirements.txt` (supabase, pydantic, pytest)
- [x] Teste pytest para `/api/health` (TDD: 1/1 ✅)
- [x] Implementar `/api/health.py`
- [x] Testes do frontend com Vitest (TDD: 3/3 ✅)
- [x] `npm run build` validado localmente
- [x] `.env.local.example` + `.gitignore`
- [x] Commit + push → deploy automático na Vercel
- [ ] Validar URL preview funcionando (depende do usuário conferir na Vercel)

### Etapa 2 — Banco de dados (Supabase) 🚧
- [x] Script SQL com criação das 5 tabelas (`db/migrations/001_init_schema.sql`)
- [x] Seed com dados de teste — profissionais e serviços (`db/seed/001_seed_profissionais_servicos.sql`)
- [x] Cliente Python `api/_lib/db.py` (lê env vars, cacheia instância, erros claros)
- [x] Testes do cliente DB com mocks (4/4 ✅)
- [x] Endpoint `/api/db_health` para validar conexão real (3/3 testes ✅)
- [x] Documentação no README
- [ ] **Pendente do usuário:** criar projeto no Supabase + configurar `SUPABASE_URL` e `SUPABASE_KEY` na Vercel
- [ ] **Pendente do usuário:** rodar as migrations + seed no SQL Editor do Supabase
- [ ] Validar `/api/db_health` em produção retornando `{"ok": true, "db": "connected"}`

### Etapa 3 — Backend (APIs serverless em Python)
- [ ] CRUD `/api/clientes` (testes + implementação)
- [ ] CRUD `/api/veiculos`
- [ ] CRUD `/api/profissionais`
- [ ] CRUD `/api/servicos`
- [ ] `/api/agendamentos` (CRUD + verificação de conflito)
- [ ] `/api/horarios_disponiveis` (lista janelas livres por profissional/serviço/dia)

### Etapa 4 — Frontend (Next.js) ✅
- [x] Layout base com navbar de navegação + footer
- [x] Página `/clientes` (listagem + formulário de cadastro com dados mock)
- [x] Página `/veiculos` (listagem + formulário com dados mock)
- [x] Página `/profissionais` (leitura, com mock)
- [x] Página `/servicos` (leitura em cards, com mock)
- [x] Página `/agendamentos` (lista com status e ações — confirmar/concluir/cancelar)
- [x] Página `/agendamentos/novo` (formulário em 2 etapas: cliente+serviço → profissional+horário)
- [x] Homepage atualizada com cards e ícones
- [x] `npm run build` validado — 10 páginas geradas com sucesso
- [x] Frontend construído com dados mock — aguardando integração com backend Python/Supabase

### Etapa 5 — Refinamentos
- [ ] Validações e mensagens de erro amigáveis
- [ ] Polimento do layout (responsivo)
- [ ] **Notificação de agendamento próximo** (prioridade baixa, deixada para o fim)
- [ ] Documentação final no README
- [ ] Deploy de produção

---

## 6. Funcionalidades da TAP (rastreabilidade)

| Funcionalidade | Prioridade | Etapa | Status |
|---|---|---|---|
| Cadastro de clientes e veículos | Alta | 3, 4 | ⏳ (frontend mock pronto, falta backend) |
| Cadastro de serviços | Alta | 3, 4 | ⏳ (frontend mock pronto, falta backend) |
| Agendamento com data e horário | Alta | 3, 4 | ⏳ (frontend mock pronto, falta backend) |
| Visualização de agenda | Alta | 4 | ✅ (frontend mock) |
| Cadastro de profissionais/mecânicos | Média | 3, 4 | ⏳ (frontend mock pronto, falta backend) |
| Verificação de conflito de horário | Média | 3 | ⏳ |
| Status do agendamento | Média | 3, 4 | ⏳ (frontend mock pronto, falta backend) |
| Notificação de agendamento próximo | Baixa | 5 | ⏳ |

---

## 7. Pendências do usuário

- [ ] Validar a URL de preview da Vercel após o primeiro deploy (Etapa 1)
- [ ] **Criar projeto no Supabase** (https://supabase.com → New project)
- [ ] **Rodar SQLs** no SQL Editor do Supabase, na ordem:
  1. `db/migrations/001_init_schema.sql`
  2. `db/seed/001_seed_profissionais_servicos.sql`
- [ ] **Configurar Environment Variables na Vercel** (Project Settings → Environment Variables):
  - `SUPABASE_URL` (da Project Settings → API → Project URL)
  - `SUPABASE_KEY` (da Project Settings → API → anon public)
- [ ] Validar `/api/db_health` em produção retornando `{"ok": true, "db": "connected"}`

---

## 8. Histórico de decisões

| Data | Decisão | Motivo |
|---|---|---|
| 2026-04-25 | Migrar de Flask + SQLite para Next.js + Python serverless + Supabase | Compatibilidade com Vercel (que é serverless e tem filesystem efêmero) |
| 2026-04-25 | TypeScript em vez de JavaScript | Padrão moderno do Next.js, ajuda a pegar bugs cedo |
| 2026-04-25 | Tailwind CSS | Produtividade e padrão da comunidade Next.js |
| 2026-04-25 | Sem autenticação na v1 | Manter o escopo simples e funcional |
| 2026-04-25 | Iniciar com `anon` key + RLS desabilitada | Não há autenticação ainda; trocar para `service_role` quando ativarmos RLS |
| 2026-04-25 | UUIDs como PK (via `gen_random_uuid()`) | Padrão do Supabase, evita colisões e permite gerar IDs no client se preciso |
| 2026-04-25 | Trocar SDK `supabase` por chamadas `httpx` ao PostgREST | SDK quebrou o build na Vercel (`uv pip install` exited with 1). httpx é leve, sem deps nativas, e cobre 100% do que precisamos (CRUD via REST) |
