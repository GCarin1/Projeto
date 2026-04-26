# 6. Frontend: páginas em Next.js

> 🧭 Capítulo 6 de 10.
> ← [5. Backend](./05-backend.md) | Próximo: [7. Fluxo de um agendamento](./07-fluxo-agendamento.md) →

O frontend é o que o usuário **vê e clica**. Aqui falamos de:

- Componentes React
- Estado (`useState`, `useEffect`)
- Como falamos com a API
- Estilização com Tailwind

## Como Next.js organiza as páginas

Cada arquivo `page.tsx` dentro de `app/` é uma URL. Sem rota manual,
sem configuração — é só criar a pasta.

```
app/
├── page.tsx                    → /
├── clientes/page.tsx           → /clientes
├── agendamentos/
│   ├── page.tsx                → /agendamentos
│   └── novo/page.tsx           → /agendamentos/novo
└── _components/                ← prefixo "_" exclui do roteamento
    └── navbar.tsx
```

> 💡 Pastas com `_` são ignoradas pelo roteador. Útil pra guardar
> componentes auxiliares que não devem virar página.

## O `layout.tsx` — a moldura do site

Esse arquivo envolve **todas** as páginas. Aqui mora o `<html>`, o
`<body>`, a navbar e o footer:

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main>{children}</main>     {/* a página atual entra aqui */}
        <footer>...</footer>
      </body>
    </html>
  );
}
```

## Server vs Client Components

No Next.js App Router, todo componente é **server** por padrão. Ele
roda no servidor, gera HTML, e o navegador recebe pronto.

Mas componentes que precisam de **interatividade** (clicar, digitar,
guardar estado, usar `useState`) precisam ser **client components**.
Você marca com `"use client";` no topo:

```tsx
"use client";  // ← isto marca como client component

import { useState } from "react";
export default function Pagina() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Cliquei {n} vezes</button>;
}
```

Quase todas as páginas deste projeto são client components, porque
mostram dados dinâmicos vindos da API.

## Estado: `useState` e `useEffect`

São os dois hooks principais do React.

```tsx
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ClientesPage() {
  // useState: guarda valores que mudam ao longo do tempo.
  const [clientes, setClientes] = useState(null);

  // useEffect: roda algo "depois que o componente apareceu na tela".
  // O array vazio [] significa "rode só uma vez, na primeira renderização".
  useEffect(() => {
    api.clientes.listar().then(setClientes);
  }, []);

  if (clientes === null) return <p>Carregando...</p>;
  return <ul>{clientes.map(c => <li key={c.id}>{c.nome}</li>)}</ul>;
}
```

O ciclo é:

1. React renderiza com `clientes = null` → mostra "Carregando…".
2. `useEffect` dispara `api.clientes.listar()`.
3. Quando volta, `setClientes(...)` atualiza o estado.
4. React renderiza de novo, agora com a lista. Mostra os nomes.

## O cliente da API: `lib/api.ts`

Em vez de fazer `fetch("/api/clientes")` espalhado em cada página,
centralizamos tudo em `lib/api.ts`:

```ts
export const api = {
  clientes: {
    listar: () => request<Cliente[]>("/api/clientes"),
    criar: (data) => request<Cliente>("/api/clientes", { method: "POST", body: JSON.stringify(data) }),
    excluir: (id) => request(`/api/clientes?id=${id}`, { method: "DELETE" }),
  },
  veiculos: { ... },
  ...
};
```

Vantagens:

- **Tipos compartilhados.** Cada página sabe que `Cliente.nome` é
  `string`, `email` é `string | null`, etc.
- **Erros uniformes.** Se algo der errado, jogamos um `ApiError` com
  status e lista de mensagens. As páginas só fazem
  `e instanceof ApiError ? e.message : "..."`.
- **Mock fácil em teste.** Como tudo passa por uma função `request`,
  basta interceptar `fetch` no Vitest.

## Tratando erros sem assustar o usuário

Cada página tem três estados:

1. **Carregando** (`clientes === null`) → spinner ou texto.
2. **Lista vazia** (`clientes.length === 0`) → "Nenhum cliente
   cadastrado".
3. **Erro** (`loadError !== null`) → mensagem amigável em pt-BR.

E nos formulários:

- Se a validação **client** falhar → mostra antes de mandar.
- Se o **backend** recusar (HTTP 422) → as mensagens dele aparecem.

Veja `app/clientes/page.tsx` ou `app/agendamentos/novo/page.tsx`.

## Estilização com Tailwind

Em vez de escrever CSS, usamos classes utilitárias direto na tag JSX:

```tsx
<button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700">
  Salvar
</button>
```

Cada classe é uma propriedade CSS pequena:
- `rounded-lg` → `border-radius: 0.5rem`
- `bg-orange-600` → `background: #ea580c`
- `px-4 py-2` → padding horizontal 1rem, vertical 0.5rem
- `hover:bg-orange-700` → cor mais escura ao passar o mouse

É verboso, mas você nunca precisa abrir um `.css` separado. Em times
grandes, isso evita "guerra de CSS" — ninguém sobrescreve a regra do
outro sem querer.

## Helpers do frontend

Coisas reutilizáveis ficam em `lib/`:

- **`lib/api.ts`** — cliente HTTP da API.
- **`lib/proximidade.ts`** — calcula se um agendamento é "Hoje", "Amanhã",
  "Atrasado". Função pura, fácil de testar.
- **`lib/validacao.ts`** — valida formato de placa e telefone antes do
  POST. Backend continua validando (autoridade), mas damos feedback rápido.

## A navbar responsiva

`app/_components/navbar.tsx` é um client component. No desktop mostra
todos os links. No mobile, mostra o ícone ☰ (hamburguer) e abre um
drawer ao clicar.

Isso usa `useState` (aberto/fechado) e `usePathname` (pra destacar a
rota atual). Como `layout.tsx` precisa exportar `metadata` (server-only),
isolamos a navbar num arquivo separado.

---

→ Próximo: [**7. Fluxo completo de um agendamento**](./07-fluxo-agendamento.md)
