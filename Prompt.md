# Projeto de Desenvolvimento de Software

## Descrição

A criação/desenvolvimento de um sistema de agendamento WEB para uma oficina mecânica de carros.
O sistema tem como objetivo possibilitar o agendamento para orçamentos e serviços de manutenção, seja ela preventiva e/ou reparos mais técnicos e críticos dos veículos, via WEB. **A aplicação irá verificar a disponibilidade de dias, horários e qual o profissional adequado** para o serviço solicitado, e agendará o cliente de acordo com o horário escolhido entre os
disponibilizados pelo sistema.

## ⚠️ Ponto de atenção

Dependendo da maneira que seja implementado, um automação pode vira algo complexo, bem complicado para conhecimento do primeiro semestre.
Sugestão → 

> Em vez da aplicação escolher de forma automática o profissional ou sugerir, o cliente escolhe o **tipo de serviço, os profissionais disponíveis** e o sistema mostra os **horários livres**.
> 

## Funcionalidades da Aplicação

| **Funcionalidade** | **Prioridade** |
| --- | --- |
| Cadastro de clientes e veículos | Alta |
| Cadastro de serviços  | Alta |
| Agendamento com data e horário | Alta |
| Visualização de agenda  | Alta |
| Cadastro de profissionais/mecânicos | Média |
| Verificação de conflito de horário | Média |
| Status do agendamento (pendente, confirmado, concluído) | Média |
| Notificação ou alerta de agendamento próximo | Baixa  |

*Priorização estabelecidas conforme o objetivo do projeto e ciclo de desenvolvimento de software.

## Fase de desenvolvimento

1. **Organizar a comunicação do Time**

Sugestões → 

- **VS Code** - Editor de código disponível para Windows, Linux e Mac OS.
- **Git Hub** - Repositório de códigos.

Uma pessoa cria o repositório, convida as demais para melhor administrar os arquivos do projeto. 

- **WhatsApp ou Discord** — para comunicação diária.
- **Notion** →Documentação, cronograma, atas de reunião e registro de decisões.

1. **Stack Recomendada** 

Frontend **→ HTML/CSS/JavaScript**

Banckend → **Python/Flask** 

Banco de Dados → **SQ lite** 

![image.png](attachment:0bf409ea-786f-4042-8098-b56784ee2a7c:image.png)

1. **Divisão do projeto** 
- Dupla 1 → Frontend
- Dupla 2 → Backend
- Dupla 3 → Banco de Dados
- Dupla 4 → Coordenação de Projeto / Integração

1. Fazer um **cronograma de entrega de cada área para o projeto conforme exigido na TAP**.
Essencial haver a divisão e prazos estabelecidos de entrega da cada dupla, assim como o período de finalização e teste. 
2. Definir que **problemas (escopo**) a solução dessa aplicação vai cobrir. Quais a necessidade do negócio em questão que nos propomos facilitar através do desenvolvimento do software. 

Ex. 

- Conflito de Horários, dificuldade de acompanhar o status do serviço, perda de informações do cliente, histórico de problemas do veículo, falta de visibilidade da agenda do dia, etc.

Essa abordagem centrada no problema deixa explicito o objetivo geral da aplicação e facilita sua demostração no final do projeto. 

---

## Definições de TAP - V8 on Fire

**Escopo** 

O escopo deste projeto consiste no desenvolvimento de uma solução que permita **realizar o cadastro**, **armazenamento** e **consulta de informações**, contemplando as principais funcionalidades necessárias para o funcionamento básico do sistema. Não estão incluídas funcionalidades avançadas, como integração com outros sistemas ou recursos complexos.

**Metodologia**

- O uso das linguagens CSS e HTML para o desenvolvimento de uma interface web seguindo etapas organizadas que incluem levantamento de requisitos, planejamento, desenvolvimento e testes.
- Planejamento: Serão realizadas reuniões de Brainstorming com a equipe para definir as funcionalidades principais (Cadastro de clientes, veículos e horários).
- Modelagem do banco de dados: Será elaborado o **Diagrama de Entidade e Relacionamento (DER)** para estruturar as tabelas de agendamentos, mecânicos e serviços. O banco de dados será implementado utilizando **SQL Developer.**
- Modelagem da aplicação (UML): Serão desenvolvidos os diagramas de caso de uso ([draw.io](http://draw.io/)) para mapear as interações do cliente e do administrador com o sistema, além do **Diagrama de Classes para orientar a estrutura do código-fonte.**

**Resultado** 

- Redução de filas na oficina.
- Interface intuitiva para o cliente.
- Maior eficiência nos serviços prestados.
- Maior rentabilidade para o negócio.

**Recursos Necessários**

Visual Studio Code e/ou VS Codium - editor de código-fonte.

Python, C - Linguagens de programação.

Git Hub - Repositório de códigos.

Notion ou trello - Documentação, cronograma, atas de reunião e registro de decisões.

HTML/CSS/JavaScript – Front End.

SQ Lite ou SQL Developer – Banco de dados
