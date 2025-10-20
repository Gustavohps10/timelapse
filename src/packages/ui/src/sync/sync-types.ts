// src/sync/sync-types.ts
import { RxCollection, RxDatabase, RxError, RxJsonSchema } from 'rxdb'

import { SyncMetadataRxDBDTO } from '@/sync/metadata-sync-schema'

import { SyncTaskRxDBDTO } from './tasks-sync-schema'
import { SyncTimeEntryRxDBDTO } from './time-entries-sync-schema'

// Um tipo de checkpoint padronizado
export type ReplicationCheckpoint = {
  updatedAt: string
  id: string
}

// Mapeia os nomes das coleções para seus tipos
export type AppCollections = {
  timeEntries: RxCollection<SyncTimeEntryRxDBDTO>
  tasks: RxCollection<SyncTaskRxDBDTO>
  metadata: RxCollection<SyncMetadataRxDBDTO>
  // Adicione futuras coleções aqui
}

export type AppDatabase = RxDatabase<AppCollections>

// Status de replicação para uma única entidade
export interface ReplicationStatus {
  isActive: boolean
  isPulling: boolean
  isPushing: boolean
  lastReplication: Date | null
  error: Error | RxError | null
}

// Configuração para uma entidade sincronizável
export interface ReplicationConfig<RxDocType, CheckpointType> {
  name: keyof AppCollections
  schema: RxJsonSchema<RxDocType>
  pull: (
    checkpoint: CheckpointType | null,
    batchSize: number,
  ) => Promise<{ documents: RxDocType[]; checkpoint: CheckpointType }>
  push: (rows: any[]) => Promise<any[]>
}

// O valor que o nosso Context irá prover
export interface SyncContextValue {
  db: AppDatabase | null
  statuses: Record<string, ReplicationStatus>
  startAllReplications: () => Promise<void>
  stopAllReplications: () => void
}
