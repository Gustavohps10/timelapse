# Contexto do Projeto Timelapse para Assistente de IA

Este documento é o guia central para o desenvolvimento do Timelapse. Ele descreve a arquitetura, as decisões técnicas, os padrões de código e os objetivos do projeto. Por favor, siga estas diretrizes rigorosamente ao gerar ou modificar código.

## 1. Visão Geral do Projeto

O Timelapse é um aplicativo de apontamento de horas multiplataforma (Desktop, Web e Mobile) com foco em uma arquitetura limpa, testável e com uma experiência de usuário offline-first/local-first.

O objetivo é criar uma base de código robusta e de fácil manutenção, onde a lógica de negócio é agnóstica à plataforma e à interface do usuário.

## 2. Arquitetura e Decisões Chave

O projeto segue os princípios da **Arquitetura Limpa (Clean Architecture)** e **Hexagonal**, com uma clara separação de responsabilidades entre os pacotes do monorepo.

### Estrutura do Monorepo

- **`packages/domain`**: O coração. Contém as entidades de negócio puras (`TimeEntry`, `Workspace`) e Value Objects. Não depende de nenhum outro pacote do projeto.
- **`packages/application`**: O cérebro. Define os casos de uso e os contratos de comportamento (interfaces como `IApplicationClient`). Depende apenas de `domain`.
- **`packages/presentation`**: A boca/ouvidos. Define os contratos de dados (ViewModels, DTOs) para comunicação externa.
- **`packages/cross-cutting`**: A caixa de ferramentas. Contém utilitários genéricos e agnósticos (`Either`, `AppError`).
- **`packages/infra`**: As mãos/pés. Implementações concretas das interfaces da `application`. Contém a lógica do RxDB, `ClientBuilder`, etc. Depende de `application`.
- **`packages/ui`**: A aparência. Pacote de componentes React. Depende de `application` para consumir os contratos.
- **`apps/*`**: Os "Maestros". São os pontos de entrada que compõem a aplicação final, conectando as peças dos outros pacotes.

### Fluxo de Dependências (Regra de Ouro)

As dependências sempre fluem em direção ao centro (`domain`). Camadas externas NUNCA podem ser importadas por camadas internas. **`infra` e `ui` nunca devem depender uma da outra.**

```mermaid
graph TD
    subgraph "Apps (Montadores)"
        A["apps/desktop"]
    end
    subgraph "Packages (Camadas)"
        UI["ui"]
        INFRA["infra"]
        APP["application"]
        DOMAIN["domain"]
    end
    A --> UI & INFRA & APP
    UI --> APP
    INFRA --> APP
    APP --> DOMAIN