'use client'

import { IApplicationAPI } from '@timelapse/application'
import { createContext, ReactNode, useContext, useRef } from 'react'
import {
  addRxPlugin,
  createRxDatabase,
  RxCollection,
  RxDatabase,
  RxError,
} from 'rxdb'
import {
  replicateRxCollection,
  RxReplicationState,
} from 'rxdb/plugins/replication'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { Subscription } from 'rxjs'
import { createStore, type StoreApi, useStore } from 'zustand'

import { automationsSchema } from '@/db/schemas/automations-schema'
import { kanbanColumnsSchema } from '@/db/schemas/kanban-column-schema'
import { kanbanTaskColumnsSchema } from '@/db/schemas/kanban-task-columns-schema'
import {
  metadataSyncSchema,
  SyncMetadataRxDBDTO,
} from '@/db/schemas/metadata-sync-schema'
import {
  SyncTaskRxDBDTO,
  tasksSyncSchema,
} from '@/db/schemas/tasks-sync-schema'
import {
  SyncTimeEntryRxDBDTO,
  timeEntriesSyncSchema,
} from '@/db/schemas/time-entries-sync-schema'
import { useWorkspace } from '@/hooks'
import { useClient } from '@/hooks/use-client'

export type ReplicationCheckpoint = { updatedAt: string; id: string }

export type AppCollections = {
  timeEntries: RxCollection<SyncTimeEntryRxDBDTO>
  tasks: RxCollection<SyncTaskRxDBDTO>
  metadata: RxCollection<SyncMetadataRxDBDTO>
  kanbanColumns: RxCollection<any>
  kanbanTaskColumns: RxCollection<any>
  automations: RxCollection<any>
}

export type AppDatabase = RxDatabase<AppCollections>

export interface ReplicationStatus {
  isActive: boolean
  isPulling: boolean
  isPushing: boolean
  lastReplication: Date | null
  error: Error | RxError | null
}

export interface IReplicationStrategy<T, C> {
  pull: (
    checkpoint: C | undefined,
    batchSize: number,
  ) => Promise<{ documents: T[]; checkpoint: C }>
  push: (rows: unknown[]) => Promise<unknown[]>
}

export interface SyncState {
  db: AppDatabase | null
  statuses: Record<string, ReplicationStatus>
  isInitialized: boolean
}

export type SyncStore = SyncState & {
  init: () => Promise<void>
  destroy: () => Promise<void>
}

class MetadataStrategy implements IReplicationStrategy<
  SyncMetadataRxDBDTO,
  ReplicationCheckpoint
> {
  constructor(
    private client: IApplicationAPI,
    private workspaceId: string,
  ) {}

  async pull(checkpoint: ReplicationCheckpoint | undefined, batchSize: number) {
    if (checkpoint && checkpoint.id === 'metadata_fixed') {
      return { documents: [], checkpoint }
    }

    const response = await this.client.services.metadata.pull({
      body: {
        workspaceId: this.workspaceId,
        memberId: '',
        batch: batchSize,
        checkpoint: {
          id: checkpoint?.id || '',
          updatedAt: new Date(checkpoint?.updatedAt || 0),
        },
      },
    })

    if (!response.data) return { documents: [], checkpoint: checkpoint! }

    const document: SyncMetadataRxDBDTO = JSON.parse(
      JSON.stringify({
        _id: 'metadata_singleton',
        _deleted: false,
        participantRoles: response.data.participantRoles || [],
        estimationTypes: response.data.estimationTypes || [],
        trackStatuses: response.data.trackStatuses || [],
        taskStatuses: response.data.taskStatuses || [],
        taskPriorities: response.data.taskPriorities || [],
        activities: response.data.activities || [],
        syncedAt: '1970-01-01T00:00:00.000Z',
      }),
    )

    return {
      documents: [document],
      checkpoint: {
        updatedAt: '1970-01-01T00:00:00.000Z',
        id: 'metadata_fixed',
      },
    }
  }
  async push() {
    return []
  }
}

class TasksStrategy implements IReplicationStrategy<
  SyncTaskRxDBDTO,
  ReplicationCheckpoint
> {
  constructor(
    private client: IApplicationAPI,
    private workspaceId: string,
  ) {}

  async pull(checkpoint: ReplicationCheckpoint | undefined, batchSize: number) {
    const response = await this.client.services.tasks.pull({
      body: {
        workspaceId: this.workspaceId,
        memberId: '',
        batch: batchSize,
        checkpoint: {
          id: checkpoint?.id || '',
          updatedAt: new Date(checkpoint?.updatedAt || 0),
        },
      },
    })

    const data = response.data || []
    if (data.length === 0) return { documents: [], checkpoint: checkpoint! }

    const lastItem = data[data.length - 1]
    const documents: SyncTaskRxDBDTO[] = JSON.parse(
      JSON.stringify(
        data.map((item) => ({
          ...item,
          _id: item.id,
          _deleted: false,
          createdAt:
            item.createdAt instanceof Date
              ? item.createdAt.toISOString()
              : item.createdAt,
          updatedAt:
            item.updatedAt instanceof Date
              ? item.updatedAt.toISOString()
              : item.updatedAt,
          startDate: item.startDate
            ? item.startDate instanceof Date
              ? item.startDate.toISOString()
              : item.startDate
            : undefined,
          dueDate: item.dueDate
            ? item.dueDate instanceof Date
              ? item.dueDate.toISOString()
              : item.dueDate
            : undefined,
          timeEntryIds: [],
          statusChanges: item.statusChanges?.map((change: any) => ({
            ...change,
            changedAt:
              change.changedAt instanceof Date
                ? change.changedAt.toISOString()
                : change.changedAt,
          })),
        })),
      ),
    )

    return {
      documents,
      checkpoint: {
        updatedAt:
          lastItem.updatedAt instanceof Date
            ? lastItem.updatedAt.toISOString()
            : lastItem.updatedAt,
        id: lastItem.id!,
      },
    }
  }
  async push() {
    return []
  }
}

class TimeEntriesStrategy implements IReplicationStrategy<
  SyncTimeEntryRxDBDTO,
  ReplicationCheckpoint
> {
  constructor(
    private client: IApplicationAPI,
    private workspaceId: string,
  ) {}

  async pull(checkpoint: ReplicationCheckpoint | undefined, batchSize: number) {
    const response = await this.client.services.timeEntries.pull({
      body: {
        workspaceId: this.workspaceId,
        memberId: '',
        batch: batchSize,
        checkpoint: {
          id: checkpoint?.id || '',
          updatedAt: new Date(checkpoint?.updatedAt || 0),
        },
      },
    })

    const data = response || []
    if (data.length === 0) return { documents: [], checkpoint: checkpoint! }

    const lastItem = data[data.length - 1]
    const documents: SyncTimeEntryRxDBDTO[] = JSON.parse(
      JSON.stringify(
        data.map((item) => ({
          ...item,
          _id: item.id!,
          _deleted: false,
          id: item.id!,
          task: { id: item.task.id },
          activity: { id: item.activity.id, name: item.activity.name },
          user: { id: item.user.id, name: item.user.name },
          timeSpent: item.timeSpent,
          comments: item.comments,
          startDate: item.startDate
            ? item.startDate instanceof Date
              ? item.startDate.toISOString()
              : item.startDate
            : undefined,
          endDate: item.endDate
            ? item.endDate instanceof Date
              ? item.endDate.toISOString()
              : item.endDate
            : undefined,
          createdAt:
            item.createdAt instanceof Date
              ? item.createdAt.toISOString()
              : item.createdAt,
          updatedAt:
            item.updatedAt instanceof Date
              ? item.updatedAt.toISOString()
              : item.updatedAt,
          syncedAt: new Date().toISOString(),
        })),
      ),
    )

    return {
      documents,
      checkpoint: {
        updatedAt:
          lastItem.updatedAt instanceof Date
            ? lastItem.updatedAt.toISOString()
            : lastItem.updatedAt,
        id: lastItem.id!,
      },
    }
  }
  async push() {
    return []
  }
}

class ReplicationModule {
  private instance?: RxReplicationState<unknown, unknown>
  private subs: Subscription[] = []
  private resyncInterval?: NodeJS.Timeout

  constructor(
    private collection: RxCollection,
    private strategy: IReplicationStrategy<unknown, unknown>,
    private options: {
      identifier: string
      batchSize?: number
      resyncSeconds?: number
      initialCheckpoint?: ReplicationCheckpoint
      onStatusChange: (s: Partial<ReplicationStatus>) => void
    },
  ) {}

  async start() {
    if (this.instance) return

    this.instance = replicateRxCollection({
      collection: this.collection,
      replicationIdentifier: this.options.identifier,
      live: true,
      retryTime: 15000,
      pull: {
        batchSize: this.options.batchSize || 25,
        initialCheckpoint: this.options.initialCheckpoint,
        handler: async (cp, batch) => {
          // Ativa o estado de carregamento manualmente no início do handler
          this.options.onStatusChange({ isPulling: true, error: null })

          try {
            const result = await this.strategy.pull(cp, batch)
            return result
          } finally {
          }
        },
      },
      push: {
        batchSize: this.options.batchSize || 20,
        handler: (rows) => {
          this.options.onStatusChange({ isPushing: true, error: null })
          return this.strategy.push(rows)
        },
      },
    })

    // --- MONITORAMENTO EM TEMPO REAL ---
    this.subs.push(
      // Monitora se a replicação está ocupada (trabalhando na rede)
      this.instance.active$.subscribe((isActive) => {
        // Se não está mais ativa, garante que pulling/pushing sejam falsos
        if (!isActive) {
          this.options.onStatusChange({
            isActive,
            isPulling: false,
            isPushing: false,
            lastReplication: new Date(),
          })
        } else {
          this.options.onStatusChange({ isActive })
        }
      }),

      // Captura erros de rede ou de permissão
      this.instance.error$.subscribe((error) => {
        console.error(`[SYNC ERROR] ${this.options.identifier}:`, error)
        this.options.onStatusChange({
          error,
          isPulling: false,
          isPushing: false,
        })
      }),
    )

    if (this.options.resyncSeconds && this.options.resyncSeconds > 0) {
      this.resyncInterval = setInterval(() => {
        this.instance?.reSync()
      }, this.options.resyncSeconds * 1000)
    }
  }

  async destroy() {
    if (this.resyncInterval) clearInterval(this.resyncInterval)
    this.subs.forEach((s) => s.unsubscribe())
    if (this.instance) await this.instance.cancel()
    this.instance = undefined
  }
}

export const createSyncStore = (
  workspaceId: string,
  client: IApplicationAPI,
): StoreApi<SyncStore> => {
  const engineModules: Record<string, ReplicationModule> = {}

  return createStore<SyncStore>((set, get) => ({
    db: null,
    statuses: {},
    isInitialized: false,

    destroy: async () => {
      const { db } = get()
      await Promise.all(Object.values(engineModules).map((m) => m.destroy()))
      if (db) await db.close()
      set({ db: null, isInitialized: false, statuses: {} })
    },

    init: async () => {
      if (get().isInitialized) return

      const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode')
      const { RxDBQueryBuilderPlugin } =
        await import('rxdb/plugins/query-builder')
      addRxPlugin(RxDBDevModePlugin)
      addRxPlugin(RxDBQueryBuilderPlugin)

      // Nao utilizado devido a falta de um storage gratuito para main process, Dexie funciona apenas no renderer
      // const isElectron = typeof window !== 'undefined' && !!(window as any).electron
      // console.log(isElectron, 'IS ELECTRON')

      // const storageBase = (isElectron
      //   ? getRxStorageIpcRenderer({
      //       mode: 'database',
      //       key: 'main-storage',
      //       ipcRenderer: (window as any).electron.ipcRenderer,
      //     })
      //   : getRxStorageDexie()) as RxStorage<unknown, unknown>

      const db = await createRxDatabase<AppCollections>({
        name: `db-${workspaceId}`,
        storage: wrappedValidateAjvStorage({
          storage: getRxStorageDexie(),
        }),
        ignoreDuplicate: true,
        multiInstance: false,
        eventReduce: true,
      })

      await db.addCollections({
        metadata: { schema: metadataSyncSchema },
        tasks: { schema: tasksSyncSchema },
        timeEntries: { schema: timeEntriesSyncSchema },
        kanbanColumns: { schema: kanbanColumnsSchema },
        kanbanTaskColumns: { schema: kanbanTaskColumnsSchema },
        automations: { schema: automationsSchema },
      })

      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
      const initialCheckpoint = {
        updatedAt: sixtyDaysAgo.toISOString(),
        id: '',
      }

      const configs = [
        {
          name: 'metadata',
          strategy: new MetadataStrategy(client, workspaceId),
          interval: 0,
          batch: 1,
        },
        {
          name: 'tasks',
          strategy: new TasksStrategy(client, workspaceId),
          interval: 300,
          batch: 30,
        },
        {
          name: 'timeEntries',
          strategy: new TimeEntriesStrategy(client, workspaceId),
          interval: 60,
          batch: 30,
        },
      ] as const

      for (const config of configs) {
        const module = new ReplicationModule(
          db[config.name as keyof AppCollections] as RxCollection,
          config.strategy as IReplicationStrategy<unknown, unknown>,
          {
            identifier: `rep_${config.name}_${workspaceId}`,
            resyncSeconds: config.interval,
            batchSize: config.batch,
            initialCheckpoint,
            onStatusChange: (status) =>
              set((state) => ({
                statuses: {
                  ...state.statuses,
                  [config.name]: {
                    ...state.statuses[config.name],
                    ...(status as ReplicationStatus),
                  },
                },
              })),
          },
        )

        await module.start()
        engineModules[config.name] = module
      }

      set({ db, isInitialized: true })
    },
  }))
}

const SyncStoreContext = createContext<StoreApi<SyncStore> | undefined>(
  undefined,
)

export const SyncProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { workspace } = useWorkspace()
  const client = useClient()
  const storeRef = useRef<StoreApi<SyncStore> | null>(null)

  if (workspace && !storeRef.current) {
    storeRef.current = createSyncStore(workspace.id, client)
  }

  if (!storeRef.current) return <>{children}</>

  return (
    <SyncStoreContext.Provider value={storeRef.current}>
      {children}
    </SyncStoreContext.Provider>
  )
}

export const useSyncStore = <T,>(
  selector: (store: SyncStore) => T,
): T | undefined => {
  const storeApi = useContext(SyncStoreContext)
  return storeApi ? useStore(storeApi, selector) : undefined
}

export const useSyncActions = (): SyncStore => {
  const storeApi = useContext(SyncStoreContext)
  if (!storeApi)
    return {
      db: null,
      statuses: {},
      isInitialized: false,
      init: async () => {},
      destroy: async () => {},
    }
  return storeApi.getState()
}
