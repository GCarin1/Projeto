# 8. Testes (TDD)

> 🧭 Capítulo 8 de 10.
> ← [7. Fluxo](./07-fluxo-agendamento.md) | Próximo: [9. Rodar e deploy](./09-rodar-deploy.md) →

> "Se eu tenho dúvida se vai dar certo, eu escrevo um teste." — todo
> dev experiente, mais ou menos.

## O que é um teste?

Um pedaço de código que **prova** que outro pedaço de código funciona.
A graça é: você escreve uma vez, e dali pra frente, toda vez que mexer
no projeto, o teste roda e te avisa se você quebrou algo sem querer.

## TDD: teste antes do código

TDD significa **Test-Driven Development** — desenvolvimento guiado por
testes. O ciclo é:

```
┌──────────┐   ┌──────────────┐   ┌──────────────┐
│ 1. Teste │ → │ 2. Implementa│ → │ 3. Refatora  │
│  vermelho│   │   verde      │   │   continua   │
└──────────┘   └──────────────┘   └──────────────┘
        ↑                                  │
        └──────────────────────────────────┘
```

1. **Vermelho:** escreve o teste para uma feature que ainda não existe.
   Ele falha (porque a função não foi implementada).
2. **Verde:** escreve o **mínimo** que faz o teste passar.
3. **Refatora:** com o teste te protegendo, melhora o código sem medo
   de quebrar.

Por que isso é mágico:

- Você escreve **só o que precisa**. Sem código a mais "pra caso a
  gente precise um dia".
- O teste vira **documentação executável**. Lendo o teste, você
  entende o que a função faz.
- Refatorar deixa de dar medo. Se quebrar, o teste avisa.

## O que testamos no V8 on Fire

### Backend (pytest, em `tests/api/`)

| Arquivo                       | O que testa                                          |
|-------------------------------|-----------------------------------------------------|
| `test_health.py`              | `/api/health` responde 200 com `{ok: true}`         |
| `test_db.py`                  | Cliente do Supabase carrega config, cacheia, etc.   |
| `test_db_health.py`           | `/api/db_health` reporta corretamente               |
| `test_http_utils.py`          | Leitura de body, escrita de JSON, parse de query    |
| `test_validators.py`          | Cada `validate_*` aceita o que deve e rejeita o resto |
| `test_clientes.py`            | GET e POST do CRUD de clientes                      |
| `test_veiculos.py`            | GET (com filtro), POST                              |
| `test_profissionais.py`       | Filtro `ativo` por padrão                           |
| `test_servicos.py`            | Lista ordenada por nome                             |
| `test_agendamentos.py`        | **detectar_conflito** + POST com conflito → 409 + PATCH status |
| `test_horarios_disponiveis.py`| Slots gerados, filtrados por conflitos              |

Total: **74 testes**.

### Frontend (vitest, em `tests/frontend/`)

| Arquivo                | O que testa                                            |
|-----------------------|--------------------------------------------------------|
| `home.test.tsx`        | Homepage renderiza e tem links para a agenda           |
| `api.test.ts`          | Cliente da API serializa parâmetros, lança `ApiError` |
| `proximidade.test.ts`  | "Hoje", "Amanhã", "Atrasado" classificados corretamente |
| `validacao.test.ts`    | Placas BR antigas e Mercosul aceitas; telefones BR OK |

Total: **30 testes**.

## Anatomia de um teste pytest

```python
# tests/api/test_validators.py
def test_validate_cliente_aceita_payload_minimo():
    resultado = validate_cliente({"nome": "Ana", "telefone": "11999999999"})
    assert resultado == {
        "nome": "Ana",
        "telefone": "11999999999",
        "email": None,
    }

def test_validate_cliente_rejeita_email_sem_arroba():
    with pytest.raises(ValidationError) as exc:
        validate_cliente({
            "nome": "Ana",
            "telefone": "11999999999",
            "email": "anaexemplo.com",
        })
    assert "email inválido" in exc.value.errors
```

**`assert ...`** é a "afirmação" que o pytest checa. Se for falso, o
teste falha.

## Anatomia de um teste Vitest

```ts
// tests/frontend/proximidade.test.ts
import { describe, expect, it } from "vitest";
import { calcularProximidade } from "@/lib/proximidade";

describe("calcularProximidade", () => {
  it("retorna 'hoje' para horários posteriores no mesmo dia", () => {
    const agora = new Date(2026, 3, 26, 14, 0);
    const futuro = new Date(2026, 3, 26, 17, 0);
    expect(calcularProximidade(futuro.toISOString(), agora)).toBe("hoje");
  });
});
```

`describe` agrupa, `it` é cada teste, `expect(...).toBe(...)` é a
afirmação.

## Como rodar

```bash
# Tudo:
pytest                 # backend
npm test               # frontend

# Um arquivo só:
pytest tests/api/test_validators.py
npx vitest run tests/frontend/proximidade.test.ts

# Em "watch mode" (roda ao salvar):
npm test               # vitest já entra em watch
ptw                    # pytest-watch (opcional)
```

## O que NÃO testamos (e por quê)

- **CSS visual.** Tailwind já está testado pelo time deles.
- **Que o navegador renderiza HTML corretamente.** É o trabalho do
  Chrome, não nosso.
- **Que o Supabase grava no PostgreSQL.** É serviço gerenciado, eles
  garantem.

Nosso foco: **a lógica do nosso código**. Detectar conflito.
Validar payload. Calcular proximidade. Filtrar slots. Isso sim é nosso.

## Mocks: como testar sem internet?

Os testes **não** chamam o Supabase de verdade. Seria lento, instável,
e dependeria de internet. Em vez disso, **mocamos** o cliente:

```python
# tests/api/conftest.py — fixture compartilhada
@pytest.fixture
def fake_client(monkeypatch):
    """Substitui o cliente do Supabase por um mock controlável nos testes."""
    ...
```

Cada teste configura "se o Supabase fosse chamado com X, devolveria Y" e
verifica como o nosso código se comporta com essa resposta. Rapidíssimo
e determinístico.

## Resumo

- TDD = teste antes do código. Vermelho → verde → refatora.
- 74 + 30 testes hoje, todos verdes.
- Backend foca em validação, conflito de horário, geração de slots.
- Frontend foca em api, proximidade, validação de input.
- Não testamos o que **outras pessoas** já testaram (Tailwind, Supabase).

---

→ Próximo: [**9. Como rodar e fazer deploy**](./09-rodar-deploy.md)
