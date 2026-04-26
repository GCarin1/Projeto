# 3. Arquitetura: as três camadas

> 🧭 Capítulo 3 de 10.
> ← [2. Stack](./02-stack.md) | Próximo: [4. Banco](./04-banco.md) →

Quase todo sistema web é organizado em **três camadas**:

```
┌──────────────────┐
│    FRONTEND      │  ← o que o usuário vê (HTML, CSS, botões)
└──────────────────┘
         ↕
┌──────────────────┐
│    BACKEND       │  ← regras de negócio, validação, autenticação
└──────────────────┘
         ↕
┌──────────────────┐
│    BANCO         │  ← onde os dados ficam guardados de verdade
└──────────────────┘
```

Cada camada tem **uma responsabilidade só**. Misturar isso é o jeito
mais rápido de criar um pesadelo de manutenção.

## A regra de ouro: cada camada confia o mínimo na outra

- **Frontend não confia que os dados são válidos.** Quando o backend
  responder, ele desenha. Se vier vazio, mostra "Carregando…".
- **Backend não confia no frontend.** O frontend pode estar com bug, ou
  alguém pode mandar requisição com `curl` direto. Por isso o backend
  **sempre** valida tudo de novo.
- **Banco não confia em ninguém.** Tem `NOT NULL`, `FOREIGN KEY`,
  `CHECK` para impedir estados inválidos mesmo se o backend errar.

## Como funciona no V8 on Fire

### Frontend (a pasta `app/`)

Páginas em React/Next.js. Cada arquivo `page.tsx` dentro de `app/` é uma
URL no site.

```
app/
├── page.tsx                  → /
├── clientes/page.tsx         → /clientes
├── agendamentos/page.tsx     → /agendamentos
└── agendamentos/novo/page.tsx → /agendamentos/novo
```

O frontend **nunca** fala direto com o banco. Ele faz `fetch("/api/...")`
e confia que o backend cuida do resto.

Toda a comunicação com a API é centralizada em `lib/api.ts`. Vantagem:
se um endpoint mudar, atualiza em **um lugar só**.

### Backend (a pasta `api/`)

Cada arquivo `.py` é uma rota:

```
api/
├── health.py                  → /api/health
├── clientes.py                → /api/clientes
├── agendamentos.py            → /api/agendamentos
└── horarios_disponiveis.py    → /api/horarios_disponiveis
```

E a pasta `api/_lib/` tem o código compartilhado (pra não repetir):

```
api/_lib/
├── db.py            ← cliente HTTP que fala com o Supabase
├── http_utils.py    ← ler JSON, escrever JSON, parse de query string
├── validators.py    ← valida cada tipo de payload
└── crud.py          ← lógica genérica de listar/criar/excluir
```

### Banco (a pasta `db/`)

Aqui ficam os SQLs:

```
db/
├── migrations/001_init_schema.sql   ← cria as 5 tabelas
└── seed/001_seed_profissionais_servicos.sql  ← dados iniciais
```

Migration = "mudança de schema versionada". Cada arquivo descreve uma
alteração que você roda exatamente uma vez. Em projetos grandes, isso
é vital para manter o banco igual em todos os ambientes.

## Por que separar assim?

Imagine que amanhã queremos um app mobile (iOS/Android). Sem separação:
você teria que reescrever tudo. Com a separação certa:

- O **app mobile** chama os mesmos endpoints `/api/*`.
- O **backend** continua igual.
- O **banco** continua igual.

Você só escreve a parte nova: a UI do app. O resto reaproveita 100%.

## Como uma requisição viaja

Vamos seguir o caminho de "listar clientes":

1. **Usuário** abre `/clientes` no navegador.
2. **Next.js** entrega a página em React.
3. O componente, no `useEffect`, chama `api.clientes.listar()`.
4. Isso vira `fetch("/api/clientes")` (HTTP GET).
5. **Vercel** recebe, identifica que `/api/clientes` é Python, e roda
   `api/clientes.py` (a função `do_GET`).
6. O Python chama o **Supabase** via HTTP:
   `GET .../rest/v1/clientes?order=criado_em.desc`.
7. O Supabase consulta o **PostgreSQL** e devolve JSON.
8. Esse JSON sobe de volta: Python → Vercel → navegador → React.
9. O componente atualiza o estado e desenha a tabela.

Tudo acontece em milissegundos, mas são **vários sistemas conversando**.

## Resumo visual

```
┌────────────┐    fetch      ┌──────────────┐   PostgREST   ┌──────────────┐
│  Frontend  │ ───────────▶  │   Backend    │ ────────────▶ │   Supabase   │
│  (Next.js) │ ◀───────────  │   (Python)   │ ◀──────────── │ (PostgreSQL) │
└────────────┘    JSON       └──────────────┘     JSON      └──────────────┘
   app/           valida → valida → valida
                    cada camada checa de novo
```

---

→ Próximo: [**4. Banco de dados (modelagem)**](./04-banco.md)
