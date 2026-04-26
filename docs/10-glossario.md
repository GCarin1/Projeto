# 10. Glossário

> 🧭 Capítulo 10 de 10.
> ← [9. Rodar e deploy](./09-rodar-deploy.md) | Próximo: [11. Integração](./11-integracao.md) →

Termos técnicos que aparecem no projeto, em português simples.

---

### API

**Application Programming Interface.** Um conjunto de "portas" que um
programa expõe para outros programas conversarem com ele. No nosso
caso, a API é o conjunto de URLs em `/api/*` que o frontend chama.

### App Router

A forma "nova" do Next.js (versão 13+) organizar páginas usando a
pasta `app/`. Cada subpasta vira uma rota.

### Async / await

Forma moderna de lidar com **operações que demoram** (rede, disco). Em
vez de empilhar `.then().then().then()`, você escreve quase como
código sequencial. `await` significa "espera essa promessa terminar".

### Backend

A parte do sistema que **não é vista** pelo usuário, mas faz o trabalho
duro: validar, falar com o banco, decidir regras de negócio.

### CRUD

**Create, Read, Update, Delete.** As quatro operações básicas em
qualquer entidade. Cliente: criar, ler (listar / detalhar), atualizar,
excluir.

### Chave estrangeira (Foreign Key, FK)

Uma coluna em uma tabela que aponta para o id de outra tabela. Garante
que a referência **realmente existe** — você não pode ter um veículo
com `cliente_id` de um cliente que não existe.

### Client component (Next.js)

Componente React que roda no **navegador**. Pode usar `useState`,
`useEffect`, ouvir eventos. Marcado com `"use client";` no topo.

### Conflict (HTTP 409)

Status de erro que o servidor manda quando a requisição **bate com
algum estado existente** que impede o sucesso. Usamos para conflito de
horário.

### Constraint (banco)

Uma regra que o banco aplica sozinho. Exemplos: `NOT NULL` (não pode
ser nulo), `FOREIGN KEY` (precisa existir na outra tabela), `CHECK`
(passa por uma expressão), `UNIQUE` (não pode repetir).

### Deploy

Subir o código para um servidor onde ele de fato roda para o público.
Na Vercel, deploy = `git push`.

### Endpoint

Cada URL específica da API. `/api/clientes` é um endpoint;
`/api/agendamentos` é outro.

### Environment variable (env var)

Variável definida fora do código, ex.: `SUPABASE_URL`. Não vai pro
git. Diferentes ambientes (dev, prod) podem ter valores diferentes.

### ESM / CommonJS

Dois jeitos de importar módulos em JavaScript. ESM (`import x from "y"`)
é o moderno; CommonJS (`require("y")`) é o antigo. Next.js usa ESM.

### Fetch

Função do navegador para fazer requisições HTTP.
`fetch("/api/clientes")` busca a lista.

### Fixture (pytest)

Função que prepara o "ambiente" para um teste. Por exemplo, um cliente
HTTP falso. Reutilizável entre testes.

### Foreign Key

Veja **Chave estrangeira**.

### Framework

Conjunto de ferramentas e convenções que facilita escrever um tipo de
aplicação. Next.js é um framework de frontend; pytest é um framework
de testes.

### Frontend

A parte que o usuário **vê e interage**: HTML, CSS, JS, botões, formulários.

### Function pure (função pura)

Função que, dada a mesma entrada, **sempre devolve a mesma saída** e
não altera nada externo. Fácil de entender, fácil de testar.
Exemplos no projeto: `detectar_conflito`, `calcularProximidade`.

### Hook (React)

Função especial que começa com `use*` e adiciona "superpoderes" a um
componente. `useState` (estado), `useEffect` (efeitos), `useMemo`
(memoização), `useRouter` (navegação).

### HTTP status code

Número que indica o resultado de uma requisição. 200 = OK, 201 =
Criado, 400 = pedido inválido, 404 = não achei, 500 = deu ruim no
servidor.

### Idempotente

Operação que dá o mesmo resultado se você executar 1 ou 100 vezes.
GET é idempotente; POST geralmente não é.

### ISO 8601

Formato padrão para datas e horas: `2026-05-05T10:00:00Z`. Sem
ambiguidade entre formatos americano e brasileiro.

### JSON

**JavaScript Object Notation.** Formato leve para representar dados.
É o que o frontend e o backend trocam.

```json
{ "nome": "Ana", "idade": 30 }
```

### JSX / TSX

JSX = HTML dentro de JavaScript. TSX = JSX em TypeScript. O React usa
isso pra escrever componentes.

```tsx
const elemento = <h1>Olá, {nome}</h1>;
```

### Migration

Um arquivo SQL que aplica uma mudança no schema do banco. Versionado
junto com o código. Cada migration roda **uma vez**.

### Mock

Substituto falso, usado em testes, no lugar de algo real (ex.: o
Supabase). Permite controlar a resposta e testar offline.

### Pipeline (CI/CD)

Sequência automática de passos que rodam a cada commit (testes, build,
deploy). Vercel faz isso pra gente.

### PostgREST

Servidor que expõe automaticamente uma API REST em cima de um
PostgreSQL. É como o Supabase nos atende; em vez de SQL, mandamos
HTTP.

### Prop (React)

Argumento passado para um componente.

```tsx
<Botao texto="Salvar" cor="orange" />
// dentro de Botao, `props.texto === "Salvar"`
```

### Race condition

Dois processos competindo pelo mesmo recurso, e o "perdedor" entra em
um estado inválido. Por isso o backend **sempre** valida, mesmo que o
frontend tenha filtrado.

### React

Biblioteca para construir interfaces. Componentes que se redesenham
quando o estado muda. Next.js é construído sobre React.

### REST

Estilo de API onde cada URL representa um recurso e o método HTTP
indica a ação. `GET /clientes` lê; `POST /clientes` cria; `PATCH
/clientes/123` atualiza; `DELETE /clientes/123` remove.

### Schema (banco)

A estrutura: quais tabelas existem, quais colunas, quais tipos, quais
constraints.

### Seed

Dados iniciais carregados no banco para que ele não comece vazio.
Profissionais e serviços de exemplo.

### Server component (Next.js)

Componente React que roda **só no servidor**. Gera HTML, é mais leve.
Não pode usar `useState` ou eventos. Padrão no App Router.

### Serverless

Modelo onde você escreve funções, e a plataforma sobe/desce instâncias
sob demanda. Você não cuida do servidor.

### Slot (de horário)

Cada bloco de tempo candidato a um agendamento. No projeto: 30 em 30
minutos, das 08:00 às 18:00 UTC.

### State (estado)

Dados que mudam ao longo do tempo no componente. Em React, gerenciados
pelo `useState`.

### Tailwind

Framework CSS baseado em classes utilitárias (uma classe por
propriedade CSS). Você estiliza diretamente no JSX.

### TDD

**Test-Driven Development.** Escrever o teste antes da implementação.
Ciclo vermelho → verde → refatora.

### TypeScript

JavaScript com tipos. Pega bugs antes de rodar.

### UTC

**Coordinated Universal Time.** Hora "neutra" sem fuso. Guardamos no
banco em UTC para evitar bugs ao mudar fuso, e convertemos para hora
local só na hora de mostrar.

### UUID

Identificador único universal, ex.:
`550e8400-e29b-41d4-a716-446655440000`. Usado como id no lugar de
números sequenciais.

### Validação

Checar se os dados recebidos fazem sentido. Em três camadas: o HTML
(input `required`), o frontend (`lib/validacao.ts`), o backend
(`api/_lib/validators.py`). Cada camada protege a próxima.

### Vercel

Plataforma de hospedagem feita pelos criadores do Next.js. Faz deploy
automático de cada `git push`. Suporta funções Python serverless.

### Watch mode

Modo dos testes/build que **fica rodando** e re-executa a cada
mudança no arquivo. Acelera o ciclo de desenvolvimento.

---

## Onde aprender mais

- [**MDN Web Docs**](https://developer.mozilla.org/pt-BR/) — referência
  open-source de HTML, CSS, JS.
- [**Documentação oficial do Next.js**](https://nextjs.org/docs)
- [**Documentação do React**](https://react.dev) — exemplos
  interativos ótimos.
- [**TypeScript Handbook**](https://www.typescriptlang.org/docs/handbook/intro.html)
- [**Supabase Docs**](https://supabase.com/docs)
- [**pytest docs**](https://docs.pytest.org/)
- [**Tailwind Docs**](https://tailwindcss.com/docs)

---

## Fim!

Você chegou ao fim do guia. 🎉

Sugestão: clone o repositório, rode tudo localmente, mude alguma coisa
pequena (mude a cor de um botão, adicione um campo "data de
nascimento" no cliente) e veja o que acontece. **Programar é experimentar.**

Boa sorte na sua jornada — e qualquer dúvida, abre uma issue ou volta
nos capítulos.

[↑ Voltar ao sumário](./README.md)
