# 9. Como rodar e fazer deploy

> 🧭 Capítulo 9 de 10.
> ← [8. Testes](./08-testes.md) | Próximo: [10. Glossário](./10-glossario.md) →

Hora de colocar o projeto pra rodar — tanto na sua máquina quanto em
produção.

## Pré-requisitos

- **Node.js 18+** ([nodejs.org](https://nodejs.org))
- **Python 3.11+** ([python.org](https://www.python.org))
- **Git** (provavelmente você já tem)
- Uma conta no **Supabase** (grátis): [supabase.com](https://supabase.com)
- Uma conta na **Vercel** (grátis, opcional para deploy): [vercel.com](https://vercel.com)

## Passo 1 — Clonar o repositório

```bash
git clone https://github.com/gcarin1/projeto.git
cd projeto
```

## Passo 2 — Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto novo.
2. Quando o banco estiver pronto, abra o **SQL Editor**.
3. Cole e execute, **na ordem**:
   - O conteúdo de `db/migrations/001_init_schema.sql`
   - O conteúdo de `db/seed/001_seed_profissionais_servicos.sql`

Isso cria as 5 tabelas e popula profissionais e serviços iniciais.

## Passo 3 — Pegar as chaves do Supabase

1. Em **Project Settings → API**, copie:
   - **Project URL** (algo como `https://abcdef.supabase.co`)
   - **anon public** key (uma string longa)

> 💡 A chave **anon** é pública por design. Pode ir no frontend. A
> chave **service_role** é privada e nunca deve aparecer no navegador.
> Como ainda não temos autenticação, a anon basta.

## Passo 4 — Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```
SUPABASE_URL=https://abcdef.supabase.co
SUPABASE_KEY=eyJhbG...
```

> ⚠️ **Nunca** commite `.env.local`. O `.gitignore` já bloqueia isso.

## Passo 5 — Instalar dependências

```bash
# Frontend
npm install

# Backend (necessário para rodar testes locais)
pip install -r requirements-dev.txt
```

## Passo 6 — Rodar localmente

```bash
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

> ⚠️ **Importante:** o `npm run dev` sobe **só o Next.js**. As funções
> Python em `/api/*.py` rodam mesmo com Next em dev — Next encaminha
> para a Vercel CLI quando configurada, ou para um runtime local. Em
> dúvida, teste em deploy de preview (passo 8).

Para validar a conexão com o banco em qualquer ambiente, acesse:

```
/api/db_health
```

Deve retornar `{"ok": true, "db": "connected"}`.

## Passo 7 — Rodar testes

```bash
# Todos os testes do backend (74 testes)
pytest

# Todos os testes do frontend (30 testes)
npm test

# Apenas um arquivo
pytest tests/api/test_validators.py
npx vitest run tests/frontend/proximidade.test.ts
```

Esperado: **74 passed** + **30 passed**.

## Passo 8 — Build de produção localmente

```bash
npm run build
```

Esse comando:

- Compila o TypeScript (e falha se houver erros de tipo).
- Roda o linter.
- Gera todas as páginas estáticas.
- Otimiza assets.

Se passar aqui, normalmente passa na Vercel.

## Passo 9 — Deploy na Vercel

### Primeira vez

1. Acesse [vercel.com/new](https://vercel.com/new).
2. Importe o repositório do GitHub.
3. **Framework preset:** Next.js (deve detectar automaticamente).
4. Em **Environment Variables**, adicione:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
5. Clique em **Deploy**.

### Próximas vezes

```bash
git add .
git commit -m "minha mudança"
git push
```

Cada push gera um **deploy preview** com URL única (útil para revisar
antes de virar produção). Pushes na `main` viram o site oficial.

## Estrutura de URL em produção

```
https://seu-projeto.vercel.app/                  ← homepage
https://seu-projeto.vercel.app/agendamentos      ← página
https://seu-projeto.vercel.app/api/agendamentos  ← endpoint Python
```

## Problemas comuns

### "Build failed: Type errors"

Algum tipo do TypeScript está errado. Olhe o log; geralmente é uma
prop faltando ou um nome trocado.

### `/api/db_health` retorna 503

O backend não conseguiu falar com o Supabase. Confira:

- As env vars `SUPABASE_URL` e `SUPABASE_KEY` estão configuradas na
  Vercel?
- Você fez **redeploy** depois de adicioná-las? (variáveis novas só
  valem em deploys posteriores)
- A URL não tem `/` no final?

### "Conflito de horário" mesmo sem ter outro agendamento

Status `cancelado` é ignorado, mas qualquer outro (pendente,
confirmado, concluído) bloqueia. Verifique no Supabase Table Editor.

### Tudo carrega, mas listas vêm vazias

Provavelmente o seed não rodou. Olhe a tabela `servicos` no Supabase —
deve ter linhas. Se não, rode novamente
`db/seed/001_seed_profissionais_servicos.sql`.

## E se eu quiser usar outro banco?

O cliente em `api/_lib/db.py` é só uma chamada `httpx` ao PostgREST.
Outro PostgREST funcionaria. Trocar pra um banco diferente exigiria
reescrever `db.py` e cada chamada — mas como está bem isolado, é
viável.

---

→ Próximo: [**10. Glossário**](./10-glossario.md)
