-- ============================================================
-- V8 on Fire - Seed de profissionais e serviços
-- ============================================================
-- Aplicar no Supabase APÓS executar 001_init_schema.sql
-- ============================================================

-- Profissionais
insert into public.profissionais (nome, especialidade, ativo) values
  ('Carlos Silva',   'Mecânica geral',          true),
  ('Marina Souza',   'Elétrica automotiva',     true),
  ('Rafael Costa',   'Suspensão e freios',      true),
  ('Juliana Rocha',  'Diagnóstico e injeção',   true)
on conflict do nothing;

-- Serviços
insert into public.servicos (nome, descricao, duracao_minutos, preco) values
  ('Troca de óleo',          'Troca de óleo do motor e filtro',                30,  150.00),
  ('Alinhamento e balanceamento', 'Alinhamento das rodas e balanceamento',     60,  180.00),
  ('Revisão preventiva',     'Checklist completo: fluidos, freios, pneus',     90,  350.00),
  ('Troca de pastilhas de freio', 'Substituição das pastilhas dianteiras',     60,  280.00),
  ('Diagnóstico eletrônico', 'Leitura de códigos de falha (scanner)',          45,  120.00),
  ('Orçamento',              'Avaliação inicial e orçamento detalhado',        30,    0.00)
on conflict do nothing;
