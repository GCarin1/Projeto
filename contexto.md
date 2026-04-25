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
| Banco | **Supabase (PostgreSQL)** | Plano gratuito, fácil setup, sem servidor para gerenciar |
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

### Etapa 2 — Banco de dados (Supabase)
- [ ] Receber URL e KEYS do Supabase do usuário
- [ ] Script SQL com criação das 5 tabelas (DER)
- [ ] Seed com dados de teste (profissionais, serviços)
- [ ] Cliente Python `api/_lib/db.py` para o Supabase
- [ ] Testes de conexão

### Etapa 3 — Backend (APIs serverless em Python)
- [ ] CRUD `/api/clientes` (testes + implementação)
- [ ] CRUD `/api/veiculos`
- [ ] CRUD `/api/profissionais`
- [ ] CRUD `/api/servicos`
- [ ] `/api/agendamentos` (CRUD + verificação de conflito)
- [ ] `/api/horarios_disponiveis` (lista janelas livres por profissional/serviço/dia)

### Etapa 4 — Frontend (Next.js)
- [ ] Layout base + navegação
- [ ] Páginas de cadastro: clientes, veículos, profissionais, serviços
- [ ] Formulário de novo agendamento (com seletor de profissional + horário disponível)
- [ ] Visualização da agenda (lista/calendário)
- [ ] Status do agendamento (mudar para confirmado/concluído/cancelado)

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
| Cadastro de clientes e veículos | Alta | 3, 4 | ⏳ |
| Cadastro de serviços | Alta | 3, 4 | ⏳ |
| Agendamento com data e horário | Alta | 3, 4 | ⏳ |
| Visualização de agenda | Alta | 4 | ⏳ |
| Cadastro de profissionais/mecânicos | Média | 3, 4 | ⏳ |
| Verificação de conflito de horário | Média | 3 | ⏳ |
| Status do agendamento | Média | 3, 4 | ⏳ |
| Notificação de agendamento próximo | Baixa | 5 | ⏳ |

---

## 7. Pendências do usuário

- [ ] Fornecer `SUPABASE_URL` e `SUPABASE_KEY` quando chegarmos na Etapa 2
- [ ] Validar a URL de preview da Vercel após o primeiro deploy

---

## 8. Histórico de decisões

| Data | Decisão | Motivo |
|---|---|---|
| 2026-04-25 | Migrar de Flask + SQLite para Next.js + Python serverless + Supabase | Compatibilidade com Vercel (que é serverless e tem filesystem efêmero) |
| 2026-04-25 | TypeScript em vez de JavaScript | Padrão moderno do Next.js, ajuda a pegar bugs cedo |
| 2026-04-25 | Tailwind CSS | Produtividade e padrão da comunidade Next.js |
| 2026-04-25 | Sem autenticação na v1 | Manter o escopo simples e funcional |
