# 7. Fluxo completo de um agendamento

> 🧭 Capítulo 7 de 10.
> ← [6. Frontend](./06-frontend.md) | Próximo: [8. Testes](./08-testes.md) →

Vamos seguir do começo ao fim o que acontece quando alguém marca um
serviço. É o jeito mais didático de ver as três camadas trabalhando
juntas.

## O cenário

Mariana chega na recepção da V8 on Fire para marcar uma **revisão
geral** no seu Gol 2018, no dia **5 de maio às 10:00** com o profissional
**João**.

A recepcionista abre `/agendamentos/novo`.

## Passo 1 — Cliente, veículo e serviço

A página, ao montar, dispara três requisições em paralelo:

```ts
const [cs, ps, ss] = await Promise.all([
  api.clientes.listar(),
  api.profissionais.listar(),
  api.servicos.listar(),
]);
```

Por que paralelo? Porque uma não depende da outra. Em série seria 3x
mais lento sem ganho nenhum.

A recepcionista escolhe **Mariana**. Quando isso acontece, o frontend
detecta a mudança de `cliente_id` e busca os veículos **só dela**:

```ts
useEffect(() => {
  if (!form.cliente_id) return;
  api.veiculos.listar({ clienteId: form.cliente_id }).then(setVeiculos);
}, [form.cliente_id]);
```

Ela seleciona o **Gol** e o serviço **Revisão geral** (90 min, R$ 350).
Vai pro passo 2.

## Passo 2 — Profissional, data e horário

Ao escolher **João** + data **5 de maio**, o frontend chama:

```
GET /api/horarios_disponiveis?profissional_id=<joao>&servico_id=<revisao>&data=2026-05-05
```

O backend (`api/horarios_disponiveis.py`):

1. Gera todos os slots de 30 em 30 min entre 08:00 e 18:00 UTC do dia 5.
2. Pesquisa os agendamentos de João nesse dia (status diferente de
   "cancelado") junto com a duração de cada serviço deles.
3. Para cada slot candidato, verifica se a janela
   `[slot, slot + 90min)` colide com algum existente.
4. Devolve os slots **livres**.

```json
{
  "horarios": [
    "2026-05-05T08:00:00+00:00",
    "2026-05-05T08:30:00+00:00",
    "2026-05-05T10:00:00+00:00",
    ...
  ]
}
```

O frontend desenha um grid de botões. A recepcionista clica em
**10:00** → a chave `form.horarioIso` recebe o ISO completo.

## Passo 3 — Confirmar

Ela clica em **Confirmar Agendamento**. O frontend faz:

```ts
await api.agendamentos.criar({
  cliente_id: "<mariana>",
  veiculo_id: "<gol>",
  servico_id: "<revisao>",
  profissional_id: "<joao>",
  data_hora: "2026-05-05T10:00:00+00:00",
});
```

Que vira:

```http
POST /api/agendamentos
Content-Type: application/json

{ "cliente_id": "...", "veiculo_id": "...", ... }
```

## O que o backend faz (em `api/agendamentos.py`)

```python
def _criar_agendamento(handler):
    # 1. Lê e valida o JSON
    payload = read_json_body(handler)
    data = validate_agendamento(payload)
    # → garante que IDs estão presentes, data_hora é ISO 8601, status válido

    # 2. Busca a duração do serviço
    resp = client.get("/servicos", params={"select": "duracao_minutos",
                                            "id": f"eq.{data['servico_id']}"})
    duracao = resp.json()[0]["duracao_minutos"]   # 90

    # 3. Busca agendamentos não cancelados do profissional
    resp = client.get("/agendamentos", params={
        "select": "id,data_hora,servicos(duracao_minutos)",
        "profissional_id": f"eq.{data['profissional_id']}",
        "status": "neq.cancelado",
    })
    existentes = resp.json()

    # 4. Verifica conflito (função pura)
    conflito = detectar_conflito(_parse_iso(data["data_hora"]), duracao, existentes)
    if conflito:
        write_json(handler, 409, {"ok": False, "error": "...", "conflito_com": conflito["id"]})
        return

    # 5. Insere via PostgREST
    resp = client.post("/agendamentos", json=data)
    write_json(handler, 201, resp.json()[0])
```

Tudo dentro de um `try/except` (centralizado em `_write_db_error`) que
transforma erros do banco em respostas HTTP apropriadas.

## O que o Supabase faz

Recebe o `POST /rest/v1/agendamentos` com o JSON. O PostgreSQL aplica
todas as constraints:

- `cliente_id` realmente existe? (FK)
- `veiculo_id` realmente existe? (FK)
- `status` é um dos quatro valores válidos? (CHECK enum)

Se passar tudo, INSERT efetuado. Devolve a linha gravada (com `id` e
`criado_em` gerados pelo banco).

## A resposta volta para o navegador

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "...",
  "cliente_id": "...",
  "veiculo_id": "...",
  ...,
  "status": "pendente",
  "criado_em": "2026-04-26T14:32:11.234Z"
}
```

O frontend recebe, e:

```ts
router.push("/agendamentos");
```

Redireciona pra agenda, onde a nova linha aparece. Como a página
`/agendamentos` faz `useEffect → api.agendamentos.listar()` ao montar,
o agendamento da Mariana já vem na lista. A função
`calcularProximidade` decide o badge ("Em 9 dias" → futuro, sem badge,
ou "Hoje" / "Amanhã" / "Atrasado" se aplicável).

## E se desse conflito?

Suponha que o José já tinha marcado uma troca de óleo com o João às
10:30 (60 min, ou seja, 10:30–11:30). A revisão da Mariana das 10:00 às
11:30 colide. O backend detectaria e responderia:

```http
HTTP/1.1 409 Conflict
{ "ok": false, "error": "conflito de horário com outro agendamento do profissional",
  "conflito_com": "<id-do-jose>" }
```

O `request()` em `lib/api.ts` levanta um `ApiError(409, ..., ["conflito de horário..."], body)`.

A página captura, mostra a mensagem em vermelho. Aliás, isso **não
deveria acontecer** porque o passo 2 já filtrou os slots livres — mas se
**dois usuários estiverem agendando ao mesmo tempo**, um vai conseguir
e o outro vai cair nessa proteção. É o que chamamos de **race
condition**. Por isso a verificação no servidor é vital.

## Diagrama do fluxo

```
USUÁRIO              FRONTEND                 BACKEND                  BANCO
  │                     │                        │                       │
  │ clica "Confirmar"   │                        │                       │
  ├────────────────────▶│                        │                       │
  │                     │ POST /api/agendamentos │                       │
  │                     ├───────────────────────▶│                       │
  │                     │                        │ valida payload         │
  │                     │                        │ busca duração serviço  │
  │                     │                        ├──────────────────────▶│
  │                     │                        │◀──── 90 min ──────────│
  │                     │                        │ busca existentes       │
  │                     │                        ├──────────────────────▶│
  │                     │                        │◀──── lista ───────────│
  │                     │                        │ detectar_conflito()    │
  │                     │                        │ (sem conflito)         │
  │                     │                        │ INSERT                 │
  │                     │                        ├──────────────────────▶│
  │                     │                        │◀──── linha ───────────│
  │                     │  201 + linha           │                       │
  │                     │◀───────────────────────┤                       │
  │ vê /agendamentos    │ router.push            │                       │
  │◀────────────────────┤                        │                       │
```

---

→ Próximo: [**8. Testes (TDD)**](./08-testes.md)
