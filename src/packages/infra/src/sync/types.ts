// Tipos essenciais para o syncEngine
export interface TimeEntryDoc {
  id: string
  project: { id: number; name: string }
  issue: { id: number }
  user: { id: number; name: string }
  activity: { id: number; name: string }
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
  lastSyncTime: string
}

export interface UpdateTimeEntryData {
  id: string
  project?: { id: number; name: string }
  issue?: { id: number }
  user?: { id: number; name: string }
  activity?: { id: number; name: string }
  hours?: number
  comments?: string
  spentOn?: Date
}
