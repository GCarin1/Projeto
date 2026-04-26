# 5. Backend: APIs em Python

> 🧭 Capítulo 5 de 10.
> ← [4. Banco](./04-banco.md) | Próximo: [6. Frontend](./06-frontend.md) →

O backend é o "cérebro" do sistema. Ele:

1. **Recebe** requisições do frontend.
2. **Valida** os dados.
3. **Conversa com o banco** para ler ou gravar.
4. **Responde** em JSON.

Tudo escrito em Python, organizado em **funções serverless**.

## O que é uma função serverless?

Tradicional: você sobe um servidor que fica ligado 24h, pronto pra
responder. Mesmo às 3h da manhã sem ninguém usando, ele consome recursos
(e dinheiro).

Serverless: cada arquivo `.py` em `/api/` é uma função independente. Ela
"acorda" quando alguém chama, processa, e dorme. Você não cuida do
servidor, só escreve a função.

## Como a Vercel sabe que é uma função?

Convenção. Cada arquivo precisa exportar uma classe `handler` com este
formato:

```python
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):    # responde a GET
        ...
    def do_POST(self):   # responde a POST
        ...
```

Isso é Python da biblioteca padrão — não é nem um framework. Só HTTP cru.

Olha um exemplo bem simples: `api/health.py` (verifica se o serviço está
no ar). É praticamente isso:

```python
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        write_json(self, 200, {"ok": True})
```

## Os helpers em `api/_lib/`

Para não repetir código, agrupamos coisas comuns:

### `db.py` — falar com o Supabase

```python
def get_client():
    """Devolve um cliente HTTP (httpx) já configurado para o PostgREST."""
```

Ele lê as variáveis de ambiente `SUPABASE_URL` e `SUPABASE_KEY` e
devolve um cliente pronto. Cacheia em memória pra não recriar a cada
requisição.

### `http_utils.py` — ler/escrever JSON

```python
read_json_body(handler)   # lê o body POST/PATCH
write_json(handler, status, dados)  # devolve resposta
parse_query(handler)      # query string como dict
ValidationError           # exceção com lista de mensagens
```

### `validators.py` — validar payloads

Pra cada tabela, uma função `validate_*`:

```python
def validate_cliente(payload):
    erros = []
    nome = _str_obrigatorio(payload, "nome", erros)
    telefone = _str_obrigatorio(payload, "telefone", erros)
    email = _str_opcional(payload, "email")
    _check_email(email, erros)
    if erros:
        raise ValidationError(erros)
    return {"nome": nome, "telefone": telefone, "email": email}
```

Por que não usar pydantic (biblioteca popular pra isso)? Tentamos.
Quebrou o build na Vercel — pacote nativo, dependências grandes. Como
nossas regras são simples, escrever 5 funções puras foi mais leve.

> 💡 **Função pura outra vez.** Recebe dict, devolve dict. Lança
> `ValidationError` em vez de logar ou abortar — quem chamou decide o
> que fazer com o erro.

### `crud.py` — listar e criar com tratamento de erro centralizado

A maior parte dos endpoints faz exatamente as mesmas três coisas:

1. listar registros
2. criar um novo
3. excluir por id

Pra não repetir try/except em todo arquivo, escrevemos `handle_list`,
`handle_create`, `handle_delete`. Os endpoints CRUD viram quase
declarativos:

```python
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        handle_list(self, "clientes", params={"order": "criado_em.desc"})

    def do_POST(self):
        handle_create(self, "clientes", validate_cliente)

    def do_DELETE(self):
        handle_delete(self, "clientes")
```

Olha `api/clientes.py` — é literalmente isso. Toda a lógica reusa
`crud.py`.

## O endpoint mais interessante: `agendamentos.py`

Diferente dos CRUDs simples, ao **criar** um agendamento ele precisa:

1. Validar o payload (`validate_agendamento`).
2. Buscar a duração do serviço escolhido.
3. Buscar todos os agendamentos não cancelados do mesmo profissional.
4. Verificar conflito (`detectar_conflito`).
5. Se conflitar → **HTTP 409** com `{"conflito_com": "<id>"}`.
6. Se não → fazer o INSERT.

E ao **atualizar**, só permite mudar o status (não a data, não o
profissional). PATCH com `?id=...`.

Veja `api/agendamentos.py` para o código completo.

## E o `/api/horarios_disponiveis`?

Este é o endpoint que "abastece" o passo 2 do formulário de novo
agendamento. Recebe `profissional_id`, `servico_id` e `data` (no formato
`YYYY-MM-DD`) e devolve uma lista de horários livres.

A ideia:

1. Gera slots de 30 em 30 minutos das **08:00 às 18:00 UTC**.
2. Pega todos os agendamentos não cancelados do profissional naquele dia.
3. Filtra os slots: descarta aqueles cuja janela conflita.
4. Devolve `{"horarios": ["2026-05-01T08:00Z", "2026-05-01T08:30Z", ...]}`.

> 💡 Por que UTC? Pra evitar bugs de fuso. O frontend converte pra hora
> local na hora de mostrar.

## Tratamento de erros — o "vocabulário" da API

| Status HTTP | Quando                                  |
|-------------|----------------------------------------|
| `200`       | OK (GET / PATCH bem-sucedido)          |
| `201`       | Criado (POST bem-sucedido)             |
| `400`       | JSON malformado                         |
| `404`       | Recurso não encontrado                  |
| `405`       | Método não permitido                    |
| `409`       | **Conflito** (horário sobreposto)      |
| `422`       | Dados inválidos (`ValidationError`)    |
| `500`       | Erro inesperado                         |
| `503`       | Banco indisponível / config faltando   |

O frontend usa esses status pra decidir o que mostrar pro usuário.

## Resumindo

- Cada arquivo `.py` em `api/` = uma rota.
- Helpers em `api/_lib/` evitam repetição.
- Funções de validação são puras (fáceis de testar).
- O endpoint mais especial é `agendamentos.py`, com a lógica de conflito.

---

→ Próximo: [**6. Frontend: páginas em Next.js**](./06-frontend.md)
