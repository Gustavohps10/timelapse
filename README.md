# Arquitetura Trackpoint: Uma Plataforma Multiplataforma e Multi-Datasource
## 1. Visão Geral
O Trackpoint é uma aplicação projetada para ser uma ferramenta de apontamento de horas flexível e robusta. Sua arquitetura foi concebida para operar em múltiplos ambientes (Web, Desktop e Mobile) e se conectar a diversas fontes de dados, desde APIs de terceiros até bancos de dados privados, sempre com foco na experiência do usuário e na segurança.

## 2. Conceitos Fundamentais
Dois conceitos principais norteiam o design do produto:

Local-First e Offline-First: As aplicações instaláveis (Desktop e Mobile) são construídas sobre este princípio. A UI interage com um banco de dados local, garantindo performance instantânea e funcionalidade contínua mesmo sem conexão com a internet. A sincronização de dados é uma tarefa secundária, que ocorre em segundo plano.

O Paradigma de Workspaces: O "Workspace" é a unidade central de trabalho no Trackpoint. Em vez de uma única fonte de dados, o usuário pode criar e alternar entre múltiplos workspaces. Cada workspace é vinculado a um único Datasource, como uma instância do Redmine, uma conexão com um banco de dados SQL, ou uma conta na plataforma SaaS do próprio Trackpoint.

## 3. Arquitetura Multiplataforma
A aplicação é dividida em três "sabores", cada um otimizado para seu ambiente, mas compartilhando uma base de código e lógica de negócios comum.

Desktop (Electron): Uma aplicação Local-First / Offline-First. Utiliza RxDB como fonte da verdade local para garantir performance e resiliência.

Mobile (React Native): Também Local-First / Offline-First. Compartilha a mesma filosofia do app Desktop, garantindo uma experiência fluida em campo.

Web Page (React + Vite): Uma aplicação Remote-First / Online-First. Oferece acesso universal e imediato de qualquer navegador, priorizando a busca de dados frescos da fonte remota.

## 4. O Desafio da Comunicação: Cliente Abstraído
Para que a mesma camada de UI (React) funcione nos ambientes Web e Desktop, o método de comunicação com a lógica de backend precisa ser abstraído.

O Problema: A UI no Electron pode se comunicar diretamente com os serviços no processo Main via IPC (window.api), um método rápido e seguro. A UI na Web, no entanto, precisa fazer requisições HTTP para uma API remota.

A Solução: Implementamos um Cliente Abstraído. É uma camada que oferece uma interface única (ex: client.get('/time-entries')) para a UI. Internamente, este cliente detecta o ambiente:

No Desktop: As chamadas são roteadas para o canal IPC do Electron.

Na Web: As chamadas são transformadas em requisições HTTP (axios/fetch) para a API Standalone.

## 5. A Camada de Sincronização: O Papel do RxDB
O RxDB é o coração das nossas aplicações Local-First (Desktop e Mobile).

Fonte da Verdade Local: Para a UI, o RxDB é a fonte da verdade. Os componentes reagem às mudanças no banco de dados local, tornando a experiência do usuário instantânea.

Sincronização em Background: O RxDB gerencia a sincronização com o datasource remoto. Ele atua como um "Git" para os dados: o banco local é um "fork" da fonte remota, e os pull/push handlers são responsáveis por manter os dois em sincronia.

Resolução de Conflitos: O RxDB possui uma estratégia padrão de resolução de conflitos ("última escrita vence"), mas a arquitetura permite a implementação de handlers customizados para lidar com cenários de conflito mais complexos.

## 6. Arquitetura de Dados Dinâmica (IoC)
A capacidade de se conectar a diferentes Workspaces (Redmine, SQL Server, etc.) é possível graças a uma camada de Injeção de Dependência (IoC) flexível.

Utilizando um container de DI como o Awilix, a aplicação instancia as classes concretas corretas em tempo de execução, com base no dataSourceType do Workspace ativo.

Se um Workspace do tipo redmine está ativo, o container resolve a interface IAuthenticationStrategy para a classe RedmineAuthenticationStrategy e ITimeEntryRepository para RedmineTimeEntryRepository.

Isso desacopla totalmente nossa lógica de aplicação das implementações específicas de cada fonte de dados.

## 7. Autenticação e Segurança
A segurança é tratada de forma diferente em cada plataforma, mas abstraída para o resto da aplicação.

Autenticação Sob Demanda: O usuário não precisa estar autenticado para começar a usar a aplicação em um workspace. Ele pode selecionar um workspace, configurar uma URL e começar a fazer apontamentos localmente (no RxDB). A autenticação só é exigida no momento em que ele tenta sincronizar os dados, provendo um fluxo de onboarding com baixo atrito.

Abstração de Tokens:

Token de Sessão (JWT): Após a autenticação bem-sucedida contra um datasource, nossa API sempre retorna um JWT padrão do Trackpoint. É este token que o cliente usa para se comunicar com nossos próprios serviços.

Credenciais do Datasource: Chaves de API ou outros segredos de serviços de terceiros são armazenados de forma segura:

No Desktop: Usamos o Keytar para salvar as credenciais no Keychain nativo do sistema operacional (Windows Credential Manager, macOS Keychain, etc.).

Na Web: As credenciais são gerenciadas pela nossa API Standalone, que as armazena de forma criptografada em seu próprio banco de dados. O navegador do cliente nunca tem acesso direto a elas.
