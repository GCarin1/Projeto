-- ============================================================
-- V8 on Fire - Schema inicial (Etapa 2)
-- ============================================================
-- Para aplicar no Supabase:
--   Project → SQL Editor → New query → cole este conteúdo → Run
-- ============================================================

-- Extensão para gerar UUIDs (já vem habilitada no Supabase, mas garantimos)
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabela: clientes
-- ------------------------------------------------------------
create table if not exists public.clientes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  telefone    text not null,
  email       text,
  criado_em   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabela: veiculos
-- ------------------------------------------------------------
create table if not exists public.veiculos (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null references public.clientes(id) on delete cascade,
  placa        text not null unique,
  marca        text not null,
  modelo       text not null,
  ano          integer
);

create index if not exists veiculos_cliente_id_idx on public.veiculos(cliente_id);

-- ------------------------------------------------------------
-- Tabela: profissionais
-- ------------------------------------------------------------
create table if not exists public.profissionais (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  especialidade   text not null,
  ativo           boolean not null default true
);

-- ------------------------------------------------------------
-- Tabela: servicos
-- ------------------------------------------------------------
create table if not exists public.servicos (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null,
  descricao          text,
  duracao_minutos    integer not null check (duracao_minutos > 0),
  preco              numeric(10, 2) not null check (preco >= 0)
);

-- ------------------------------------------------------------
-- Tabela: agendamentos
-- ------------------------------------------------------------
-- status: pendente | confirmado | concluido | cancelado
create table if not exists public.agendamentos (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid not null references public.clientes(id),
  veiculo_id        uuid not null references public.veiculos(id),
  profissional_id   uuid not null references public.profissionais(id),
  servico_id        uuid not null references public.servicos(id),
  data_hora         timestamptz not null,
  status            text not null default 'pendente'
                      check (status in ('pendente','confirmado','concluido','cancelado')),
  observacoes       text,
  criado_em         timestamptz not null default now()
);

create index if not exists agendamentos_data_hora_idx on public.agendamentos(data_hora);
create index if not exists agendamentos_profissional_data_idx
  on public.agendamentos(profissional_id, data_hora);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
-- Por enquanto (sem login) deixamos as tabelas SEM RLS.
-- Quando adicionarmos autenticação, habilitamos com:
--   alter table public.<tabela> enable row level security;
-- e criamos policies adequadas. Por enquanto, manter desabilitado.
-- ============================================================
