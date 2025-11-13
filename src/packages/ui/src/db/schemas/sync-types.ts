// src/sync/sync-types.ts

import { RxCollection, RxDatabase, RxError, RxJsonSchema } from 'rxdb'

import { SyncMetadataRxDBDTO } from '@/db/schemas/metadata-sync-schema'

import { SyncTaskRxDBDTO } from './tasks-sync-schema'
import { SyncTimeEntryRxDBDTO } from './time-entries-sync-schema'

export type ReplicationCheckpoint = {
  updatedAt: string
  id: string
}

export type AppCollections = {
  timeEntries: RxCollection<SyncTimeEntryRxDBDTO>
  tasks: RxCollection<SyncTaskRxDBDTO>
  metadata: RxCollection<SyncMetadataRxDBDTO>
}

export type AppDatabase = RxDatabase<AppCollections>

// CONFIGURAÇÃO DE REPLICAÇÃO APRIMORADA ✨
// Agora com opções específicas por coleção
export interface ReplicationConfig<RxDocType> {
  name: keyof AppCollections
  schema: RxJsonSchema<RxDocType>

  // Configurações opcionais da replicação
  live?: boolean // Padrão: true
  retryTime?: number // Padrão: 10000ms
  batchSize?: number // Padrão: 100
  initialCheckpointFactory?: () => ReplicationCheckpoint

  // Handlers de pull e push (sem alteração na assinatura)
  pull: (
    checkpoint: ReplicationCheckpoint | null,
    batchSize: number,
  ) => Promise<{ documents: RxDocType[]; checkpoint: ReplicationCheckpoint }>
  push: (rows: any[]) => Promise<any[]>
}

// TIPOS PARA O STORE ZUSTAND 🧠
// O estado reativo que os componentes vão consumir
export interface SyncState {
  db: AppDatabase | null
  statuses: Record<string, ReplicationStatus>
  isInitialized: boolean
}

// As ações (funções) para interagir com o store
export interface SyncActions {
  init: () => Promise<void>
  destroy: () => Promise<void>
}

// O tipo completo do nosso store
export type SyncStore = SyncState & SyncActions

// Status de replicação (sem alteração)
export interface ReplicationStatus {
  isActive: boolean
  isPulling: boolean
  isPushing: boolean
  lastReplication: Date | null
  error: Error | RxError | null
}
