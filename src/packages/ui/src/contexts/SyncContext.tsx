import { createContext } from 'react'
import { RxCollection } from 'rxdb'

import { SyncTimeEntryRxDBDTO } from '@/sync/time-entries-sync-schema'

export interface SyncContextValue {
  isActive: boolean
  isPulling: boolean
  isPushing: boolean
  lastReplication: Date | null
  error: any
  databaseName: string | null
  collectionName: string | null
  timeEntriesCollection: RxCollection<SyncTimeEntryRxDBDTO> | null
  initialize: (workspaceId: string) => Promise<void>
  stop: () => void
}

export const SyncContext = createContext<SyncContextValue | undefined>(
  undefined,
)
