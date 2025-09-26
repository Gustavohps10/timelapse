# Estrutura de Relacionamentos: Workspace → Task → TimeEntry

## Visão Geral

Este documento descreve a nova estrutura de relacionamentos implementada no sistema de sincronização, onde:

- **Workspace** representa uma organização ou equipe
- **Task** representa uma unidade de trabalho onde os apontamentos são rastreados
- **TimeEntry** representa os logs de tempo (apontamentos) vinculados a uma Task específica

## Relacionamentos

```
Workspace (1) ←→ (N) Task (1) ←→ (N) TimeEntry
```

### Antes (Modelo Antigo)
- `TimeEntry` estava diretamente vinculado ao `Workspace`
- `Task` existia mas não tinha relacionamento claro com `TimeEntry`

### Depois (Novo Modelo)
- `TimeEntry` agora se conecta a `Task` via `taskId`
- `Task` pertence a `Workspace` via `workspaceId`
- `TimeEntry` não tem mais relacionamento direto com `Workspace`

## Definições de Entidades

### Workspace
Representa uma organização ou equipe (ex: Empresa A, Equipe Dev).

**Schema RxDB**: `workspaces`
```typescript
{
  id: string
  name: string
  dataSource: string
  dataSourceConfiguration?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  _deleted?: boolean
}
```

### Task
Representa uma unidade de trabalho onde os apontamentos são rastreados. Pode ser uma tarefa, issue, projeto ou qualquer item de trabalho.

**Schema RxDB**: `tasks`
```typescript
{
  id: string
  title: string
  description: string
  workspaceId: string
  isFallback: boolean
  externalId?: string
  externalType?: string
  createdAt: string
  updatedAt: string
  _deleted?: boolean
}
```

**Características Especiais**:
- `isFallback`: Indica se é uma "General Task" de fallback para fontes de dados sem suporte a tasks
- `externalId`/`externalType`: Para vinculação a fontes de dados externas (ex: issues do Jira, tarefas do GitHub)

### TimeEntry
Representa logs de tempo (apontamentos) vinculados a uma Task específica.

**Schema RxDB**: `time_entries`
```typescript
{
  id: string
  taskId: string // Novo campo de relacionamento
  project: { id: number; name: string }
  issue: { id: number }
  user: { id: number; name: string }
  activity: { id: number; name: string }
  hours: number
  comments?: string
  spentOn: string
  createdAt: string
  updatedAt: string
  _deleted?: boolean
}
```

## Estratégia de Task Fallback

Para fontes de dados que não suportam tasks (como Clockify com apontamentos diretos de workspace), o sistema automaticamente cria uma "General Task" de fallback sob o workspace correspondente.

### Métodos do TaskService

- `getOrCreateFallbackTask(workspaceId)`: Obtém ou cria uma Task de fallback
- `createTaskFromExternal(workspaceId, externalData)`: Cria Task a partir de dados externos
- `getTaskById(taskId)`: Recupera Task por ID
- `getTasksByWorkspace(workspaceId)`: Lista Tasks por workspace

## Coleções RxDB

O sync engine agora gerencia três coleções:

1. **workspaces**: Entidades Workspace
2. **tasks**: Entidades Task
3. **time_entries**: Entidades TimeEntry com relacionamento taskId

## Estratégia de Migração

### Versionamento de Schema
- Schema TimeEntry incrementado para versão 1
- Novo campo `taskId` adicionado como obrigatório
- Campos legados mantidos para compatibilidade

### Migração de Dados
1. TimeEntries existentes sem taskId serão atribuídos a Tasks de fallback
2. Tasks de fallback são automaticamente criadas por workspace
3. Fontes de dados externas podem criar Tasks específicas conforme necessário

## Mapeamento de Fontes de Dados

### Redmine
```typescript
// Mapeia issues do Redmine para Tasks
const task = {
  id: `redmine-${issue.id}-${workspaceId}`,
  title: issue.subject,
  description: issue.description,
  workspaceId,
  isFallback: false,
  externalId: issue.id.toString(),
  externalType: 'issue'
}
```

### Jira
```typescript
// Mapeia issues do Jira para Tasks
const task = {
  id: `jira-${issueId}-${workspaceId}`,
  title: issue.summary,
  description: issue.description,
  workspaceId,
  isFallback: false,
  externalId: issueId,
  externalType: 'issue'
}
```

### Clockify
```typescript
// Cria Task de fallback para Clockify
const fallbackTask = {
  id: `clockify-fallback-${workspaceId}`,
  title: 'General Task',
  description: 'Fallback task for Clockify time entries',
  workspaceId,
  isFallback: true
}
```

### YouTrack
```typescript
// Mapeia tasks do YouTrack para Tasks
const task = {
  id: `youtrack-${task.id}-${workspaceId}`,
  title: task.summary,
  description: task.description,
  workspaceId,
  isFallback: false,
  externalId: task.id,
  externalType: 'task'
}
```

## Benefícios

1. **Relacionamentos Mais Claros**: Hierarquia Workspace → Task → TimeEntry
2. **Flexibilidade de Tasks**: Suporte para tarefas, issues, projetos ou qualquer unidade de trabalho
3. **Compatibilidade de Fontes de Dados**: Estratégia de fallback para fontes sem suporte a tasks
4. **Melhor Organização**: Apontamentos adequadamente categorizados por tasks
5. **Extensibilidade Futura**: Fácil adição de novos tipos de tasks e integrações externas

## Exemplos de Uso

### Criando uma Task
```typescript
const task = Task.create({
  title: "Fix login bug",
  description: "Resolve authentication issue",
  workspaceId: "ws-123",
  isFallback: false,
  externalId: "JIRA-123",
  externalType: "issue"
})
```

### Criando uma Task de Fallback
```typescript
const fallbackTask = Task.createFallback("ws-123")
```

### TimeEntry com Task
```typescript
const timeEntry = TimeEntry.create({
  taskId: "task-456",
  project: { id: 1, name: "My Project" },
  issue: { id: 123 },
  user: { id: 1, name: "John Doe" },
  activity: { id: 1, name: "Development" },
  hours: 2.5,
  comments: "Fixed the bug",
  spentOn: new Date()
})
```

## Arquivos Modificados

### Camada de Domínio
- `src/packages/domain/src/entities/Task.ts` (atualizado com relacionamento workspaceId)
- `src/packages/domain/src/entities/TimeEntry.ts` (adicionado taskId)

### Camada de Aplicação
- `src/packages/application/src/dtos/TaskDTO.ts` (atualizado com novos campos)
- `src/packages/application/src/dtos/TimeEntryDTO.ts` (adicionado taskId)

### Camada de Apresentação
- `src/packages/presentation/src/view-models/TaskViewModel.ts` (atualizado com novos campos)
- `src/packages/presentation/src/view-models/TimeEntryViewModel.ts` (adicionado taskId)

### Camada de Infraestrutura
- `src/packages/infra/src/sync/schemas/WorkspaceSchema.ts` (novo)
- `src/packages/infra/src/sync/schemas/TaskSchema.ts` (novo)
- `src/packages/infra/src/sync/schemas/TimeEntrySchema.ts` (atualizado com taskId)
- `src/packages/infra/src/sync/types.ts` (adicionados novos tipos de documento)
- `src/packages/infra/src/sync/TaskService.ts` (novo)
- `src/packages/infra/src/sync/IntelligentSyncService.ts` (integrado TaskService)
- `src/packages/infra/src/sync/mappers.ts` (atualizado para taskId)
- `src/packages/infra/src/sync/syncEngine.ts` (adicionadas novas coleções)
