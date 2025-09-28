<p>

![header-light](./docs/diagram-light.png#gh-dark-mode-only)
![header-dark](./docs/diagram-dark.png#gh-light-mode-only)

</p>

## Ambiente

###### Package Manager
Use `Yarn v4` como gerenciador de pacotes. Deve ser a versão 4 para lidar com Monorepos

###### Adding Components
Execute `yarn shadcn add button switch card popover tooltip` para adicionar novos componentes ao pacote de UI.

###### Build
Execute `yarn build` para compilar os pacotes.

###### Development Mode
Execute `yarn dev` para iniciar o ambiente de desenvolvimento e hot-swapping em paralelo.

###### Committing
Utilize o padrão de commits do Angular (ex: `feat: add new feature`) conforme validado pelo commitlint. Certifique-se de que os arquivos em stage estejam corretamente formatados — o projeto utiliza lint-staged para aplicar o lint automaticamente antes dos commits.

###### Recomendações
Utilize o Visual Studio Code ou outra IDE com compatibilidade com os plugins:
  - Tailwind CSS Intellisense (para facilitar a visualização das classes disponiveis enquanto coda), 
  - PostCSS para editar arquivos .css especiais com `at-rules`
  - Eslint e Prettier para identação de código automática ao salvar arquivo

# Todo
- [X] Realizar testes na API do Redmine avaliando possibilidades (encontrar rotas para Autenticação e Consulta/Inserção de Entradas de Tempo)
- [X] Iniciar camadas base (Dominio e Regra de negocio)
- [X] Iniciar construção da base para camada de UI 
- [X] Separar em Monorepo
- [X] Configurar Turbo Repo
- [X] Iniciar SDK para astrai e possibilitar criação de difetentes fontes de dados / plugins
- [X] Separar plugin do Redmine e campos que serão utilizados para autenticação 
- [X] Iniciar fluxo inicial de criação de Workspaces (Selecionar um plugin (por enquanto fixo hard-coded o plugin do Redmine), configurar URLs, entre outras configs daquele espaço de trabalho)
- [X]  Iniciar fluxo de envio de credenciais dinamicas para o redmine e armazenamento seguro de informacoes com Keytar
- [X] Versionamento com Changesets
- [X] Separar plugin do Redmine em outro Repositório e publicar no NPM
- [X] Fazer Download e Injetar plugins dinamicamente em tempo de execução com Container De Ioc e estudar possibilidades para fazer menu de busca de plugins semelhante a Extensões do VS Code
- [ ] Em Progresso ⏳; Implementar motor de sincronização com RxDB [replication-http](https://rxdb.info/replication-http.html) 
  - ## Fase 1: Preparação do Backend
    - A API interna  deve expor três métodos essenciais para gerenciar a sincronização de dados.
    - [ ] 1.1. Criar Rota de pull
      - Endpoint:  /sync/time-entries/pull
      - Finalidade: Fornecer ao cliente RxDB as alterações ocorridas desde a última sincronização.
      - Request Body: { checkpoint: { updatedAt: string, id: string } | null, limit: number }
      - Response Body: { documents: Document[], checkpoint: { updatedAt: string, id: string } }
    - [ ] 1.2. Criar Rota de push
      - Endpoint: POST /sync/time-entries/push
      - Finalidade: Receber do cliente RxDB um lote de documentos criados ou alterados offline.
      - Request Body: { documents: Document[] }
      - Response Body: { conflicts: Document[] } (um array com os documentos que não puderam ser salvos).
    - [ ] 1.3. Criar Rota de findByPeriod
      - Endpoint: POST /time-entries/by-period
      - Finalidade: Fornecer à UI o lote inicial de dados recentes na primeira sincronização ("carga rápida").
      - Request Body: { startDate: string, endDate: string } (outros filtros como userId e workspaceId devem ser extraídos do JWT).
      - Response Body: { data: Document[], totalItems: number, ... }

  - ## Fase 2: Estruturar o Banco de Dados Local
    - O cliente (Frontend) deve ter seus schemas RxDB finalizados para suportar a sincronização.
    - [ ] 2.1. Adicionar Coleção de tasks
      - A coleção deve ser adicionada ao banco de dados local para armazenar informações de contexto como title e estimatedHours.
    - [ ] 2.2. Atualizar Coleção de workspaces
      - O schema deve ser atualizado para incluir um campo de controle de estado, como prioritySyncStatus: 'PENDING' | 'COMPLETED', para gerenciar o ciclo de vida da sincronização.

  - ## Fase 3: Construir a Lógica de Sincronização no Cliente
    - Um orquestrador, chamado SyncManager, deve ser criado no cliente para gerenciar os dois processos de sincronização.
    - [ ] 3.1. Implementar a Carga Rápida
      - Criar uma função que, na primeira conexão de um workspace, busca os dados dos últimos 60 dias através da rota findByPeriod para tornar o app útil imediatamente.
    - [ ] 3.2. Implementar a Replicação Contínua
      - Criar a função principal que inicia o RxDB.syncHTTP() contra as rotas pull e push, mantendo os dados recentes atualizados em tempo real e enviando as alterações feitas - offline.

  - ## Fase 4: Conectar na Interface (UI)
    - O SyncManager deve ser integrado ao ciclo de vida da aplicação.
    - [ ] 4.1. Gerenciar o Ciclo de Vida da Sincronização
      - A sincronização para um workspace deve ser iniciada ou parada automaticamente com base no estado de autenticação do usuário e no workspace selecionado.
    - [ ] 4.2. Refatorar Telas para Serem Reativas
      - Todas as telas da UI devem ser refatoradas para ler os dados exclusivamente do banco local (RxDB) através de consultas reativas (.$), garantindo que a interface se atualize automaticamente à medida que a sincronização ocorre em segundo plano.

# Arquitetura da Plataforma
## 1. Visão Geral
Esta é uma plataforma de apontamento de horas Local-First projetada com base em três pilares: performance, flexibilidade e autonomia do usuário. Sua arquitetura opera em múltiplos ambientes (Web, Desktop, Mobile) e se conecta a diversas fontes de dados através de um ecossistema de plugins aberto.

## 2. Conceitos Fundamentais
Local-First: A UI sempre interage primariamente com um banco de dados local no dispositivo do usuário, resultando em uma experiência de uso instantânea.

Banco de Dados Local com PGlite: Para garantir robustez e a capacidade de análises complexas, a plataforma utiliza PGlite (PostgreSQL em WebAssembly) como motor de armazenamento para o RxDB.

Offline-First (Desktop/Mobile): As aplicações instaláveis são totalmente funcionais sem conexão com a internet. A sincronização ocorre em segundo plano.

O Paradigma de Workspaces
O "Workspace" é a unidade central de trabalho. Ele permite que o usuário se conecte a diferentes fontes de dados de forma segura e isolada.

Criação Local-Only: Todo workspace nasce como local-only, permitindo o uso imediato sem a necessidade de conexão com serviços externos.

Conexões Dinâmicas: Um workspace pode ser vinculado, desvinculado e ter seu conector trocado ao longo do tempo (ex: de Redmine para Jira).

Rastreamento de Origem: Para garantir a integridade dos dados, cada apontamento de horas (TimeEntry) é "carimbado" com o ID do conector ativo no momento de sua criação (source_plugin_id). Isso preserva o histórico e impede a mistura de dados ao trocar de conector.

## 3. Arquitetura Multiplataforma
A plataforma é materializada em três aplicações cliente distintas:

🖥️ Desktop (Electron): Uma aplicação Local-First e Offline-First.

📱 Mobile (React Native): Também Local-First e Offline-First.

🌐 Web Page (React + Vite): Uma aplicação Local-First que, após o carregamento inicial, opera com o banco de dados PGlite local no navegador.

## 4. Ecossistema de Conectores (Plugins)
A plataforma é extensível através de um sistema de conectores.

O SDK (@<seu_escopo>/connector-sdk): Um pacote NPM que define as interfaces que qualquer conector deve implementar.

Conectores: Pacotes independentes (ex: redmine-plugin) que contêm a lógica para se comunicar com uma API de terceiro.

Instalação Dinâmica: O aplicativo pode descobrir, baixar e carregar esses conectores em tempo de execução.

## 5. Camada de Sincronização (RxDB)
O RxDB é o coração da arquitetura Local-First.

Fonte da Verdade Local: A UI reage às mudanças no banco de dados local, tornando a experiência instantânea.

Sincronização em Background: O RxDB gerencia a sincronização com o datasource remoto através de pull/push handlers, que por sua vez utilizam o conector ativo do workspace.

## 6. Autenticação e Segurança
A identidade do usuário é sempre contextual ao workspace ativo.

Autenticação Sob Demanda: O usuário pode trabalhar em modo local-only indefinidamente. A autenticação só é exigida ao tentar sincronizar um workspace vinculado.

Armazenamento Seguro: As credenciais são salvas de forma segura:

No Desktop: Usando Keytar (cofre de senhas do SO).

Na Web: A lógica dependerá da implementação (ex: backend da API Standalone).

## 7. Funcionalidades e Visão de Futuro
Dashboards por Workspace: Gráficos e análises de produtividade específicos para cada contexto de trabalho.

Controle de Apontamentos: Visão tabular para gerenciar todos os apontamentos.

Colaboração P2P: Expansão futura para permitir que equipes colaborem em um mesmo workspace, sincronizando seus bancos de dados locais diretamente.
