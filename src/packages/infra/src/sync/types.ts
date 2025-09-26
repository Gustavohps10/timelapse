export interface WorkspaceDoc {
  id: string
  name: string
  dataSource: string
  dataSourceConfiguration?: Record<string, unknown>
  createdAt: string // ISO datetime string
  updatedAt: string // ISO datetime string
  _deleted?: boolean
}

export interface TaskDoc {
  id: string
  title: string
  description: string
  workspaceId: string
  isFallback: boolean
  externalId?: string
  externalType?: string
  createdAt: string // ISO datetime string
  updatedAt: string // ISO datetime string
  _deleted?: boolean
}

export interface TimeEntryDoc {
  id: string
  taskId: string
  project: { id: string; name: string }
  issue: { id: string }
  user: { id: string; name: string }
  activity: { id: string; name: string }
  hours: number
  comments?: string
  spentOn: string // ISO date string (YYYY-MM-DD)
  createdAt: string // ISO datetime string
  updatedAt: string // ISO datetime string
  _deleted?: boolean
}

export interface SyncCheckpoint {
  id: string
  time: number
  lastSyncTime: string // ISO datetime string
}

export interface UpdateTimeEntryData {
  id: string
  project?: { id: number; name: string }
  issue?: { id: number }
  user?: { id: number; name: string }
  activity?: { id: number; name: string }
  hours?: number
  comments?: string
  spentOn?: Date // UI trabalha com Date
}
