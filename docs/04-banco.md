# 4. Banco de dados (modelagem)

> 🧭 Capítulo 4 de 10.
> ← [3. Arquitetura](./03-arquitetura.md) | Próximo: [5. Backend](./05-backend.md) →

O banco é a base de tudo. Se ele estiver mal modelado, qualquer coisa
construída por cima vai sofrer.

## As 5 tabelas

```
clientes ──────┐
               │ tem
               ▼
            veiculos
               │
               │ usado em
               ▼
       ┌── agendamentos ──┐
       │                  │
       │                  ▼
       │           profissionais
       │
       └─────▶ servicos
```

### `clientes`

Quem agenda. Identificamos pelo telefone, mas guardamos nome e e-mail
opcional.

```sql
clientes
  - id (uuid, pk)
  - nome (text)
  - telefone (text)
  - email (text, opcional)
  - criado_em (timestamp)
```

### `veiculos`

Cada cliente pode ter vários veículos. Note a `cliente_id` apontando pra
tabela `clientes`: isso é uma **chave estrangeira** (foreign key).

```sql
veiculos
  - id (uuid, pk)
  - cliente_id (uuid, fk → clientes.id)
  - placa (text)
  - marca (text)
  - modelo (text)
  - ano (int, opcional)
```

> 💡 **Chave estrangeira (FK):** uma coluna que aponta pra outra tabela.
> Garante que o `cliente_id` em `veiculos` **realmente existe** em
> `clientes`. O banco recusa salvar um veículo de um cliente
> inexistente. Isso se chama **integridade referencial**.

### `profissionais`

Os mecânicos da oficina.

```sql
profissionais
  - id (uuid, pk)
  - nome (text)
  - especialidade (text)   ← "elétrica", "motor", "geral"...
  - ativo (bool)           ← se já não trabalha mais, fica false
```

Em vez de **deletar** um profissional que saiu, marcamos `ativo = false`.
Isso preserva o histórico: agendamentos antigos continuam apontando para
o profissional certo, mesmo que ele não apareça mais nas listas.

### `servicos`

O catálogo: troca de óleo, alinhamento, revisão completa, etc.

```sql
servicos
  - id (uuid, pk)
  - nome (text)
  - descricao (text, opcional)
  - duracao_minutos (int)
  - preco (numeric)
```

A **duração** é fundamental: ela define quanto tempo o profissional
ficará ocupado, e portanto quando outros agendamentos podem caber.

### `agendamentos`

A "ligação" entre tudo:

```sql
agendamentos
  - id (uuid, pk)
  - cliente_id (uuid, fk)
  - veiculo_id (uuid, fk)
  - profissional_id (uuid, fk)
  - servico_id (uuid, fk)
  - data_hora (timestamp)
  - status ('pendente'|'confirmado'|'concluido'|'cancelado')
  - observacoes (text, opcional)
  - criado_em (timestamp)
```

Cada agendamento amarra um cliente, um veículo, um serviço, um
profissional e um momento.

## Por que UUID em vez de número?

Você poderia usar um id sequencial (1, 2, 3, …) — é o jeito clássico.
Por que UUID?

1. **Não vaza informação.** "Tem 1234 clientes!" se você usa id 1235.
2. **Pode ser gerado no cliente.** Útil em apps offline.
3. **Difícil de adivinhar.** Não dá para enumerar com `?id=1, ?id=2…`.
4. **É padrão do Supabase** (eles geram com `gen_random_uuid()`).

Custo: um pouco mais de espaço (16 bytes vs 8). Pra este projeto, vale.

## A regra crucial: conflito de horário

> Um profissional não pode ter dois agendamentos cuja janela
> `[data_hora, data_hora + duracao)` se sobreponha.

Onde isso é checado?

- **No backend Python**, em `api/agendamentos.py`, função
  `detectar_conflito`.
- Decidimos **não** colocar essa restrição como `EXCLUDE` no PostgreSQL.
  Seria possível (com `tstzrange` + extensão `btree_gist`), mas exigiria
  um JOIN complicado entre `agendamentos` e `servicos` dentro da
  constraint. Em Python o código fica mais legível e testável.

A função `detectar_conflito` é **pura**: recebe a data nova, a duração
nova, e a lista de agendamentos existentes. Devolve o conflitante ou
`None`. Não toca rede, não toca banco — por isso é fácil testar.

```python
def detectar_conflito(nova_data, nova_duracao, existentes):
    nova_fim = nova_data + timedelta(minutes=nova_duracao)
    for ag in existentes:
        ini = parse_iso(ag["data_hora"])
        fim = ini + timedelta(minutes=ag["servicos"]["duracao_minutos"])
        # bordas iguais não conflitam (10:00-11:00 e 11:00-11:30 são OK)
        if ini < nova_fim and nova_data < fim:
            return ag
    return None
```

> 💡 **Função pura** = mesma entrada → mesma saída, sem efeito colateral.
> É o "bom comportamento" mais valioso em testes.

## Onde estão os SQLs?

- `db/migrations/001_init_schema.sql` — cria todas as tabelas, índices,
  e tipos enum (status do agendamento).
- `db/seed/001_seed_profissionais_servicos.sql` — popula com profissionais
  e serviços de exemplo, pra você não começar com tudo vazio.

## Como rodar?

No SQL Editor do Supabase, cola o conteúdo do arquivo e executa. Pronto.

> Em projetos grandes, ferramentas como Alembic, Flyway ou Prisma cuidam
> de aplicar migrations automaticamente. Aqui, copiar e colar é o
> bastante para a v1.

---

→ Próximo: [**5. Backend: APIs em Python**](./05-backend.md)
