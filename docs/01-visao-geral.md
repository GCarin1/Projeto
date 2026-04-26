# 1. Visão geral do sistema

> 🧭 **Onde estamos?** Capítulo 1 de 10.
> Próximo: [2. Stack](./02-stack.md) →

## O problema que resolvemos

Imagine uma oficina mecânica chamada **V8 on Fire**. Hoje, quando alguém
quer marcar um serviço, liga no telefone. Alguém precisa anotar a hora
em uma agenda de papel, ver se algum mecânico está livre, decidir um
preço… e torcer pra ninguém esquecer.

Esse projeto resolve isso com uma página na internet: o cliente escolhe
serviço, profissional e horário; a oficina vê tudo organizadinho.

## O que o sistema faz

Em uma frase: **"agendar serviços de uma oficina mecânica pela web"**.

Funcionalidades concretas:

| Funcionalidade | Quem usa | Onde |
|---|---|---|
| Cadastrar clientes | Recepção | `/clientes` |
| Cadastrar veículos do cliente | Recepção | `/veiculos` |
| Ver lista de serviços oferecidos | Todos | `/servicos` |
| Ver lista de profissionais | Todos | `/profissionais` |
| Criar um agendamento (cliente + veículo + serviço + horário) | Recepção | `/agendamentos/novo` |
| Ver a agenda e mudar status (confirmar / concluir / cancelar) | Recepção | `/agendamentos` |

## O que **não** faz (decisões de escopo)

- ❌ **Login**: nesta primeira versão, qualquer pessoa que acessa pode
  usar. Adicionar autenticação envolveria muitos detalhes (senha,
  recuperação, permissões) que fugiriam do foco.
- ❌ **Pagamento online**: o pagamento acontece na oficina.
- ❌ **Notificações por SMS/e-mail**: ficou para depois. Em vez disso, a
  agenda destaca visualmente os agendamentos próximos com um badge
  "Hoje", "Amanhã" ou "Atrasado".

> 💡 **Lição:** definir o que **não** faz é tão importante quanto definir
> o que faz. Senão o projeto cresce para sempre e nunca termina.

## A regra mais importante

> Um profissional **não pode** ter dois agendamentos cujos horários se
> sobreponham.

Parece óbvio, mas tem detalhes. Se o João tem um serviço das **10:00 às
11:00** e alguém tenta marcar das **10:30 às 11:30**, **conflita**. Já se
alguém marcar das **11:00 às 11:30** (logo depois), **não conflita** —
porque o anterior termina exatamente quando o novo começa.

Vamos ver como isso vira código no [capítulo 5](./05-backend.md).

## A jornada de um agendamento

Em alto nível, o que acontece quando alguém clica em "Confirmar
Agendamento":

```
[Navegador] ─ requisição HTTP ─→ [Backend Python] ─ SQL ─→ [Banco PostgreSQL]
                                       ↓
                              valida, checa conflito
                                       ↓
[Navegador] ←─── resposta JSON ─── [Backend Python] ←──── linha criada ────
```

Cada uma dessas setas é um capítulo deste guia. Vai ficar claro!

## Princípios que guiaram o projeto

- **Simples e funcional acima de tudo.** Antes de adicionar algo
  bonitinho, garantimos que o essencial funciona.
- **TDD (Test-Driven Development).** Escrevemos os testes **antes** do
  código de produção. Veja o [capítulo 8](./08-testes.md).
- **Sem login (por enquanto).** Foco no fluxo principal.
- **Etapas com checklist.** O `contexto.md` na raiz registra cada etapa
  concluída — é a memória de longo prazo do projeto.

---

→ Próximo: [**2. Stack: as ferramentas e por que escolhemos cada uma**](./02-stack.md)
