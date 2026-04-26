# 📚 V8 on Fire — Guia de Estudo

Bem-vindo! Esta pasta tem uma documentação **didática** do projeto, pensada
pra quem está começando em programação e quer entender como funciona um
sistema web "de verdade", de ponta a ponta.

A ideia é que você possa ler na ordem dos capítulos, abrir o código nas
referências e, no fim, ter uma noção sólida de:

- como um site moderno se comunica com um banco de dados
- o que é "frontend", "backend", "API" e "serverless"
- por que escrevemos testes antes do código
- como o projeto está organizado e por quê

> 💡 **Dica:** abra cada capítulo em uma aba e o código em outra. Toda vez
> que algo for citado, vá lá no arquivo e leia algumas linhas. É assim
> que se aprende — não memorizando, mas relacionando.

## 📖 Sumário

1. [Visão geral do sistema](./01-visao-geral.md)
   *— o que o projeto faz e por quê.*
2. [Stack: as ferramentas e por que escolhemos cada uma](./02-stack.md)
   *— Next.js, Python, Supabase, Vercel… o que é cada um.*
3. [Arquitetura: as três camadas](./03-arquitetura.md)
   *— frontend, backend, banco. Quem fala com quem.*
4. [Banco de dados (modelagem)](./04-banco.md)
   *— tabelas, chaves estrangeiras e a regra de conflito de horário.*
5. [Backend: APIs em Python](./05-backend.md)
   *— como uma função serverless funciona, validação, CRUD.*
6. [Frontend: páginas em Next.js](./06-frontend.md)
   *— componentes, estado, comunicação com a API.*
7. [Fluxo completo de um agendamento](./07-fluxo-agendamento.md)
   *— do clique do usuário até o INSERT no banco.*
8. [Testes (TDD)](./08-testes.md)
   *— por que escrevemos teste antes do código.*
9. [Como rodar e fazer deploy](./09-rodar-deploy.md)
   *— passo a passo para subir o projeto.*
10. [Glossário](./10-glossario.md)
    *— termos técnicos explicados em português simples.*
11. [Integração Frontend ↔ Backend ↔ Banco](./11-integracao.md)
    *— mergulho técnico: lib/api.ts, PostgREST, embeddings, env vars.*

## 🎯 O que você vai aprender

- Diferença entre **frontend** e **backend** com um exemplo real
- O que é uma **API REST** e como ela vira código
- Como **TypeScript** ajuda a evitar bugs antes mesmo de rodar
- Por que **PostgreSQL** é poderoso (e o que é uma chave estrangeira)
- Como **funções serverless** funcionam (sem precisar montar servidor)
- Como organizar um projeto que mistura **Python** e **JavaScript/TypeScript**
- Como escrever **testes** que te dão coragem de mudar o código

## 🤝 Como contribuir com a documentação

Se algo aqui ficou confuso, abra uma issue ou um PR explicando. Documentação
boa é documentação que evolui junto com quem lê.

---

→ Comece por: [**1. Visão geral do sistema**](./01-visao-geral.md)
