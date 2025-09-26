# Data Model Refactoring: Task → Task

## Overview

This document describes the refactoring of the data model to rename `Task` to `Task` and establish proper relationships between entities.

## New Entity Relationships

```
Workspace (1) ←→ (N) Task (1) ←→ (N) TimeEntry
```

### Before (Old Model)
- `TimeEntry` was directly linked to `Workspace`
- `Task` existed but had no clear relationship to `TimeEntry`

### After (New Model)
- `TimeEntry` is now linked to `Task`
- `Task` belongs to `Workspace`
- `TimeEntry` no longer has direct relationship to `Workspace`

## Entity Definitions

### Workspace
Represents an organization or team (e.g., Company A, Dev Team).

**RxDB Schema**: `workspaces`
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
Represents a work unit where time entries are tracked. Can be a task, issue, or project. (The term 'work item' is no longer used; use 'Task' for all cases.)

**RxDB Schema**: `tasks`
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

**Special Features**:
- `isFallback`: Indicates if this is a fallback "General Task" for data sources that don't support tasks
- `externalId`/`externalType`: For linking to external data sources (e.g., Jira issues, GitHub tasks)

### TimeEntry
Represents time logs (apontamentos) linked to a specific Task.

**RxDB Schema**: `time_entries`
```typescript
{
  id: string
  taskId: string // New relationship field
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

## Fallback Task Strategy

For data sources that don't support tasks (like Clockify with direct workspace time entries), the system automatically creates a fallback "General Task" under the corresponding workspace.

### TaskService Methods

- `getOrCreateFallbackTask(workspaceId)`: Gets or creates a fallback Task
- `createTaskFromExternal(workspaceId, externalData)`: Creates Task from external data
- `getTaskById(taskId)`: Retrieves Task by ID
- `getTasksByWorkspace(workspaceId)`: Lists Tasks by workspace

## RxDB Collections

The sync engine now manages three collections:

1. **workspaces**: Workspace entities
2. **tasks**: Task entities  
3. **time_entries**: TimeEntry entities with taskId relationship

## Migration Strategy

### Schema Versioning
- TimeEntry schema version incremented to 1
- New `taskId` field added as required
- Legacy fields maintained for backward compatibility

### Data Migration
1. Existing TimeEntries without taskId will be assigned to fallback Tasks
2. Fallback Tasks are automatically created per workspace
3. External data sources can create specific Tasks as needed

## Benefits

1. **Clearer Relationships**: TimeEntry → Task → Workspace hierarchy
2. **Flexible Tasks**: Support for tasks, issues, or projects
3. **Data Source Compatibility**: Fallback strategy for sources without task support
4. **Better Organization**: Time entries are properly categorized by tasks
5. **Future Extensibility**: Easy to add new task types and external integrations

## Usage Examples

### Creating a Task
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

### Creating a Fallback Task
```typescript
const fallbackTask = Task.createFallback("ws-123")
```

### TimeEntry with Task
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

## Files Modified

### Domain Layer
- `src/packages/domain/src/entities/Task.ts` → `Task.ts`
- `src/packages/domain/src/entities/TimeEntry.ts` (added taskId)
- `src/packages/domain/src/entities/index.ts` (updated exports)

### Application Layer
- `src/packages/application/src/dtos/TaskDTO.ts` → `TaskDTO.ts`
- `src/packages/application/src/dtos/TimeEntryDTO.ts` (added taskId)
- `src/packages/application/src/dtos/index.ts` (updated exports)

### Presentation Layer
- `src/packages/presentation/src/view-models/TaskViewModel.ts` → `TaskViewModel.ts`
- `src/packages/presentation/src/view-models/TimeEntryViewModel.ts` (added taskId)
- `src/packages/presentation/src/view-models/index.ts` (updated exports)

### Infrastructure Layer
- `src/packages/infra/src/sync/schemas/WorkspaceSchema.ts` (new)
- `src/packages/infra/src/sync/schemas/TaskSchema.ts` (new)
- `src/packages/infra/src/sync/schemas/TimeEntrySchema.ts` (updated with taskId)
- `src/packages/infra/src/sync/types.ts` (added new document types)
- `src/packages/infra/src/sync/TaskService.ts` (new)
- `src/packages/infra/src/sync/IntelligentSyncService.ts` (integrated TaskService)
- `src/packages/infra/src/sync/mappers.ts` (updated for taskId)
- `src/packages/infra/src/sync/syncEngine.ts` (added new collections)
