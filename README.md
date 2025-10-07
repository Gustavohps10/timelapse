# ⏱️ Timelapse

## Uma Plataforma Local-First para Apontamento de Horas com Foco em Performance e Flexibilidade

<p  width="100%" >
  
  <img src="./docs/diagram-light.png#gh-dark-mode-only" width="100%" />
  <img src="./docs/diagram-dark.png#gh-light-mode-only" width="100%" />

</p>

Este projeto é uma **plataforma de apontamento de horas Local-First**, construída para oferecer uma experiência de uso instantânea, robusta e extensível. Sua arquitetura prioriza a **autonomia do usuário** e a **performance offline**, utilizando um ecossistema de **plugins dinâmicos** para se conectar a diferentes fontes de dados (Redmine, Jira, etc.).

---

## 💡 Conceitos Arquiteturais Chave

O projeto é guiado pelos seguintes pilares, que garantem sua flexibilidade e alta performance:

| Conceito | Descrição | Tecnologia Base |
| :--- | :--- | :--- |
| **Local-First** | A interface de usuário *sempre* interage com o banco de dados local. Isso garante carregamento instantâneo, independentemente da latência da rede. | **RxDB + PGlite** |
| **Offline-First** | As aplicações instaláveis (Desktop/Mobile) são totalmente funcionais sem conexão com a internet. A sincronização é um processo em *background*. | **RxDB Replication** |
| **Workspaces** | Unidades centrais de trabalho. Permitem ao usuário isolar e gerenciar conexões a diferentes fontes de dados de forma segura (ex: um workspace para Time A com Redmine, outro para Time B com Jira). | **Monorepo** |
| **Ecossistema de Plugins** | A plataforma é extensível. Novas **Fontes de dados** (SDK) podem ser baixadas e carregadas dinamicamente em tempo de execução para integrar com qualquer API de terceiro. | **GitHub, Container IoC** |

---

## 💻 Configuração e Ambiente de Desenvolvimento

Este projeto utiliza um **Monorepo** gerenciado pelo **Turbo Repo** e adota o `Yarn v4` como gerenciador de pacotes, essencial para lidar com pacotes locais (`workspaces`).

### Pré-requisitos
- **Node.js (LTS)**
- **Yarn v4**

### 📦 Comandos Principais

| Comando | Descrição |
| :--- | :--- |
| `yarn install` | Instala todas as dependências do monorepo. |
| `yarn dev` | Inicia o ambiente de desenvolvimento com **hot-swapping** (execução paralela). |
| `yarn build` | Compila e gera os pacotes de distribuição. |
| `yarn shadcn add [componente]` | Adiciona novos componentes da biblioteca de UI ao pacote local. |

### Padrões e Qualidade de Código

- **Committing:** Utilizamos o padrão de commits **Angular** (ex: `feat: add new feature`), validado pelo `commitlint`.
- **Formatação:** O `lint-staged` aplica automaticamente as regras do **ESLint** e **Prettier** aos arquivos em *stage* antes de cada commit.
- **Versionamento:** O versionamento e gestão de *changelogs* são feitos com **Changesets**.

### 🛠️ Recomendações de IDE

Recomendamos o **Visual Studio Code** com os seguintes plugins para otimizar a experiência de desenvolvimento:

- **Tailwind CSS Intellisense:** Facilita a autocomplicação e visualização das classes Tailwind disponíveis.
- **PostCSS Language Support:** Essencial para trabalhar com arquivos `.css` que utilizam `at-rules` customizadas.
- **ESLint & Prettier:** Para garantir a formatação e linting automáticos ao salvar.

---

## 🎯 Status do Projeto: Roadmap (TODO)

Esta seção detalha o progresso e o foco atual do desenvolvimento.

### ✅ Concluído

- [X] Realizar testes na API do Redmine e definir rotas de autenticação e consulta.
- [X] Estruturar as camadas base: **Domínio**, **Regra de Negócio** e **UI**.
- [X] Estruturar o projeto em **Monorepo** e configurar o **Turbo Repo**.
- [X] Iniciar o **SDK** para abstrair fontes de dados/plugins.
- [X] Implementar o fluxo de criação de **Workspaces** (configuração de URL/plugin).
- [X] **Armazenamento Seguro:** Implementação de `Keytar` (Desktop) para credenciais dinâmicas.
- [X] **Ecossistema de Plugins:** Separar o `redmine-plugin` em repositório externo e publicar no NPM/Github.
- [X] Implementar a **Instalação Dinâmica de Plugins** em tempo de execução via Container de Inversão de Controle (IoC).
- [ ] ⏳ Em Progresso: Implementação do Motor de Sincronização (RxDB)

O foco atual é implementar a replicação HTTP contínua com **RxDB Replication** para sincronizar o banco de dados local com as APIs externas.

#### 🏗️ Fase 1: Preparação do Backend (API Interna)

| Item | Status | Descrição |
| :--- | :--- | :--- |
| **1.1. Rota de Pull** | ✅ | Endpoint `/sync/time-entries/pull`. Implementar a lógica de replicação incremental e *batching* (máx. 50 documentos), utilizando o `checkpoint` (`updatedAt` + `id`) para evitar perdas e garantir a continuidade da sincronização. |
| **1.2. Rota de Push** | ✅ | Endpoint `POST /sync/time-entries/push`. Receber e processar documentos criados/alterados offline pelo cliente. Deve retornar *conflicts* se houver falhas. |

#### 💿 Fase 2: Estruturar o Banco de Dados Local

| Item | Status | Descrição |
| :--- | :--- | :--- |
| **2.1. Coleção de Tasks** | [ ] | Adicionar coleção para armazenar dados de contexto (título, horas estimadas) para o apontamento. |
| **2.2. Workspaces Schema** | [ ] | Atualizar o schema para incluir um campo de controle de estado (`prioritySyncStatus`) para gerenciar o ciclo de vida da sincronização. |

#### 🔄 Fase 3: Construir a Lógica de Sincronização no Cliente (SyncManager)

| Item | Status | Descrição |
| :--- | :--- | :--- |
| **3.1. Carga Rápida** | [ ] | Função que busca dados dos últimos 60 dias (`findByPeriod`) na primeira conexão, garantindo que o app seja útil imediatamente antes da sincronização completa. |
| **3.2. Replicação Contínua** | [ ] | Função principal que inicia o `RxDB.syncHTTP()` contra as rotas **pull** e **push**, mantendo os dados atualizados em tempo real e enviando alterações offline. |

#### 🖼️ Fase 4: Conectar na Interface (UI)

| Item | Status | Descrição |
| :--- | :--- | :--- |
| **4.1. Gerenciar Ciclo de Vida** | [ ] | Iniciar/parar a sincronização de um workspace automaticamente com base no seu estado de autenticação. |
| **4.2. Refatorar Telas Reativas** | [ ] | Todas as telas devem ler dados **exclusivamente** do RxDB via consultas reativas (useQuery/.$), garantindo que a UI se atualize em tempo real com a sincronização em *background*. |

---

## ⚙️ Arquitetura da Plataforma

### 1. Multiplataforma

O projeto é materializado em três clientes distintos, todos operando em um modelo **Local-First**:

- 🖥️ **Desktop (Electron + React):** Aplicação Local-First e Offline-First completa.
- 📱 **Mobile (Capacitor + React):** Aplicação Local-First e Offline-First.
- 🌐 **Web Page (React + Vite):** Após o carregamento inicial, opera com o banco de dados **PGlite (PostgreSQL em WebAssembly)** localmente no navegador.

### 2. O Paradigma de Workspaces

O `Workspace` é o mecanismo de segurança e isolamento de dados:
- **Criação Local-Only:** Workspaces podem ser criados e usados imediatamente, sem a necessidade de uma conexão externa.
- **Conexões Dinâmicas:** Podem ser vinculados, desvinculados ou ter seu conector trocado ao longo do tempo (ex: de Redmine para Jira).
- **Rastreamento de Origem:** Cada apontamento (`TimeEntry`) é "carimbado" com o ID da fonte de dados (`source_plugin_id`) no momento de sua criação, garantindo a integridade e prevenindo a mistura de dados ao trocar de conector.

### 3. Ecossistema de Fontes de Dados (Plugins)

A extensibilidade é garantida por um sistema de plugins:

- **SDK (`@<seu_escopo>/connector-sdk`):** Define as interfaces (`pull`, `push`, `auth`, etc.) que qualquer conector deve implementar.
- **Fontes de Dados:** Pacotes independentes (`redmine-plugin`, `jira-plugin`) que contêm a lógica de comunicação com APIs de terceiros.
- **Instalação Dinâmica:** O aplicativo pode descobrir, baixar e carregar esses plugins em tempo de execução, criando um ambiente aberto semelhante às extensões do VS Code.

### 4. Autenticação e Segurança

A segurança é contextual ao workspace ativo:

- **Autenticação Sob Demanda:** O modo "local-only" é ilimitado. A autenticação é exigida **apenas** para sincronizar um workspace vinculado.
- **Armazenamento de Credenciais:** As chaves de acesso são salvas de forma segura:
    - **Desktop:** Utilizando **Keytar** (cofre de senhas nativo do SO).
    - **Web:** Dependerá da implementação do backend da API Standalone (TBD).

### 5. Visão de Futuro (Futuras Funcionalidades)

- **Colaboração P2P (Peer-to-Peer):** Permitir que equipes colaborem em um mesmo workspace, sincronizando seus bancos de dados locais diretamente.
- **Dashboards por Workspace:** Gráficos e análises de produtividade customizados para cada contexto de trabalho.
- **Controle de Apontamentos:** Visão tabular avançada para gerenciar e editar o histórico de horas.
