# 2. Stack: as ferramentas e por que escolhemos cada uma

> 🧭 Capítulo 2 de 10.
> ← [1. Visão geral](./01-visao-geral.md) | Próximo: [3. Arquitetura](./03-arquitetura.md) →

"Stack" é o conjunto de tecnologias que você empilha pra construir um
projeto. Cada peça resolve uma parte: uma desenha a tela, outra guarda
os dados, outra processa as regras de negócio.

A stack do V8 on Fire ficou assim:

```
┌──────────────────────────────────────────────────────┐
│  NAVEGADOR (o computador do usuário)                 │
│  ─ Next.js + React + TypeScript + Tailwind CSS       │
└──────────────────────────────────────────────────────┘
                       ↕ HTTP (JSON)
┌──────────────────────────────────────────────────────┐
│  VERCEL (servidor "serverless")                      │
│  ─ Funções Python em /api/*.py                       │
│  ─ Cada arquivo vira uma rota da API                 │
└──────────────────────────────────────────────────────┘
                       ↕ HTTP (PostgREST)
┌──────────────────────────────────────────────────────┐
│  SUPABASE (banco de dados gerenciado)                │
│  ─ PostgreSQL                                         │
└──────────────────────────────────────────────────────┘
```

Vamos passar peça por peça.

---

## Frontend

### Next.js (com App Router)

**O que é:** um framework de JavaScript/TypeScript pra construir sites.
Roda em cima do React.

**Por que Next.js e não só React?**
- **Roteamento automático**: cada pasta dentro de `app/` vira uma URL.
  `app/clientes/page.tsx` é a página `/clientes`.
- **Server Components** (renderizar HTML no servidor) e **Client
  Components** (rodam no navegador) — ele permite os dois conforme você
  precisa.
- **Build otimizado**: gera páginas estáticas quando possível, o que
  carrega rápido.
- **Integração nativa com a Vercel**: deploy é só dar `git push`.

### TypeScript

**O que é:** JavaScript com tipos.

```ts
// JavaScript:
function somar(a, b) { return a + b }
somar("oi", 3) // "oi3" — bug silencioso!

// TypeScript:
function somar(a: number, b: number): number { return a + b }
somar("oi", 3) // ❌ erro detectado antes de rodar
```

Por que importa: o TypeScript pega bugs **antes** de você apertar
"Executar". Em projetos médios, isso economiza muito tempo de debug.

### Tailwind CSS

**O que é:** uma forma de estilizar usando classes pré-prontas, em vez
de escrever CSS do zero.

```tsx
// Em vez de:
<button className="meu-botao">Salvar</button>
// e em outro arquivo: .meu-botao { background: orange; padding: 8px 16px; ... }

// Com Tailwind:
<button className="bg-orange-600 px-4 py-2 rounded-lg">Salvar</button>
```

Vantagem: você nunca sai de um arquivo só para mexer no estilo. O design
vive junto com o componente.

---

## Backend

### Python serverless na Vercel

**O que é "serverless"?** Você escreve uma função; a plataforma (Vercel)
sobe um pequeno servidor pra ela só quando alguém chama. Quando ninguém
usa, ela "dorme" e não cobra nada.

**Por que Python?** Era a linguagem do plano original do projeto, ensinada
nas aulas. Ele integra bem com a Vercel (que aceita Python como runtime
oficial).

**Como funciona:** todo arquivo em `/api/*.py` que defina uma classe
`handler` herdando de `BaseHTTPRequestHandler` vira automaticamente uma
rota. Por exemplo, `api/clientes.py` responde em `/api/clientes`.

```python
class handler(BaseHTTPRequestHandler):
    def do_GET(self): ...   # responde a GET /api/clientes
    def do_POST(self): ...  # responde a POST /api/clientes
```

### httpx (em vez do SDK oficial do Supabase)

A primeira tentativa foi usar o SDK oficial `supabase-py`. Ele quebrou o
build na Vercel (deps nativas grandes). A solução: usar `httpx` (cliente
HTTP simples) e falar **diretamente com a REST API do Supabase**
(chamada PostgREST). Mais leve, sem mistério.

> 💡 Esse é um padrão comum: às vezes a "biblioteca oficial" é demais
> pro que você precisa. A REST está ali, basta chamar.

---

## Banco de dados

### Supabase + PostgreSQL

**O que é Supabase:** um serviço que te dá um PostgreSQL pronto, na
internet, com plano gratuito generoso. Por trás, é só PostgreSQL — você
pode largar o Supabase e levar o banco em outro lugar quando quiser.

**Por que PostgreSQL e não MySQL/SQLite?**
- É o banco relacional mais robusto open-source.
- Tem tipos avançados (JSON, ranges, arrays) que ajudam.
- Funciona muito bem em produção.

**PostgREST:** o Supabase expõe automaticamente uma API REST sobre as
tabelas. Em vez de escrever SQL, você manda HTTP:

```
GET https://meuprojeto.supabase.co/rest/v1/clientes?order=criado_em.desc
```

E recebe JSON. É isso que nosso backend usa.

---

## Hospedagem

### Vercel

**O que é:** uma plataforma que pega seu repositório do GitHub e publica
seu site. Cada `git push` na branch `main` faz um deploy automático.

**Por que essa combinação:**
- Next.js foi feito pela própria Vercel — integração perfeita.
- Aceita Python como runtime de funções serverless.
- Plano gratuito serve de sobra para um projeto deste tamanho.

---

## Testes

### pytest (Python) e Vitest (TypeScript)

Cada um é o "padrão da casa" da sua linguagem:
- **pytest**: simples, descobre testes automaticamente em arquivos
  `test_*.py`, sintaxe limpa com `assert`.
- **Vitest**: feito pra ser rápido. API muito parecida com Jest, mas
  roda em segundos.

Veja o [capítulo 8](./08-testes.md) sobre por que testes vêm primeiro.

---

## Resumo da escolha

| Camada     | Escolha                | Em uma frase                                   |
|------------|------------------------|------------------------------------------------|
| Frontend   | Next.js + TS + Tailwind | Páginas tipadas e estilo direto no componente |
| Backend    | Python serverless       | Funções pequenas, sem servidor pra cuidar     |
| Banco      | Supabase (PostgreSQL)   | Banco gerenciado com REST de graça            |
| Hospedagem | Vercel                  | Deploy automático no `git push`               |

---

→ Próximo: [**3. Arquitetura: as três camadas**](./03-arquitetura.md)
