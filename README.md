# V8 on Fire

Sistema de agendamento web para a oficina mecânica V8 on Fire.

## Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Funções serverless em Python (rodando na Vercel)
- **Banco:** Supabase (PostgreSQL)
- **Hospedagem:** Vercel

## Como rodar localmente

```bash
# 1. Dependências do frontend
npm install

# 2. Dependências do backend (Python)
pip install -r requirements-dev.txt

# 3. Variáveis de ambiente (Etapa 2 em diante)
cp .env.local.example .env.local
# preencha SUPABASE_URL e SUPABASE_KEY

# 4. Dev server do Next.js
npm run dev

# 5. Testes
npm test          # frontend (vitest)
pytest            # backend (pytest)
```

## Banco de dados (Supabase)

Para preparar o banco em um novo projeto Supabase:

1. Crie o projeto no [Supabase](https://supabase.com).
2. No SQL Editor, execute na ordem:
   - `db/migrations/001_init_schema.sql`
   - `db/seed/001_seed_profissionais_servicos.sql`
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public` key.
4. Configure essas variáveis na Vercel (Environment Variables) e em `.env.local` localmente.
5. Acesse `/api/db_health` no deploy para validar a conexão.

## Estrutura

Veja `contexto.md` para a documentação completa de etapas, decisões e progresso.
