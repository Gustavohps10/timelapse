'use client'

import {
  MetadataViewModel,
  TaskViewModel,
  TimeEntryViewModel,
  ViewModel,
} from '@timelapse/presentation/view-models'
import { createContext, ReactNode, useContext, useRef } from 'react'
import {
  addRxPlugin,
  createRxDatabase,
  RxCollection,
  RxDatabase,
  RxError,
  RxJsonSchema,
} from 'rxdb'
import {
  replicateRxCollection,
  RxReplicationState,
} from 'rxdb/plugins/replication'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { createStore, type StoreApi, useStore } from 'zustand'

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

export interface ReplicationStatus {
  isActive: boolean
  isPulling: boolean
  isPushing: boolean
  lastReplication: Date | null
  error: Error | RxError | null
}

export interface ReplicationConfig<RxDocType, CheckpointType> {
  name: keyof AppCollections
  schema: RxJsonSchema<RxDocType>
  pull: (
    checkpoint: CheckpointType | undefined,
    batchSize: number,
  ) => Promise<{ documents: RxDocType[]; checkpoint: CheckpointType }>
  push: (rows: any[]) => Promise<any[]>
}

export interface SyncState {
  db: AppDatabase | null
  statuses: Record<string, ReplicationStatus>
  isInitialized: boolean
}

export interface SyncActions {
  init: () => Promise<void>
  destroy: () => Promise<void>
}

export type SyncStore = SyncState & SyncActions

export const createSyncStore = (
  workspaceId: string,
  client: any,
): StoreApi<SyncStore> => {
  let replications: Record<string, RxReplicationState<any, any>> = {}
  let reSyncInterval: NodeJS.Timeout | null = null

  const replicationConfigs: ReplicationConfig<any, ReplicationCheckpoint>[] = [
    {
      name: 'metadata',
      schema: metadataSyncSchema,
      pull: async (checkpoint, batchSize) => {
        const response: ViewModel<MetadataViewModel> =
          await client.services.metadata.pull({
            body: {
              batch: batchSize,
              workspaceId,
              checkpoint: {
                ...checkpoint!,
                updatedAt: new Date(checkpoint!.updatedAt),
              },
              memberId: '',
            },
          })
        const data = response.data
        if (!data) {
          return { documents: [], checkpoint: checkpoint! }
        }
        const document: SyncMetadataRxDBDTO = {
          _id: '1',
          _deleted: false,
          participantRoles: data.participantRoles,
          estimationTypes: data.estimationTypes,
          trackStatuses: data.trackStatuses,
          taskStatuses: data.taskStatuses,
          taskPriorities: data.taskPriorities,
          activities: data.activities,
          syncedAt: new Date().toISOString(),
        }
        const newCheckpoint = {
          updatedAt: new Date().toISOString(),
          id: workspaceId,
        }
        return { documents: [document], checkpoint: newCheckpoint }
      },
      push: async (rows) => {
        return []
      },
    },
    {
      name: 'timeEntries',
      schema: timeEntriesSyncSchema,
      pull: async (checkpoint, batchSize) => {
        const response: TimeEntryViewModel[] =
          await client.services.timeEntries.pull({
            body: {
              workspaceId,
              memberId: '',
              checkpoint: {
                ...checkpoint!,
                updatedAt: new Date(checkpoint!.updatedAt),
              },
              batch: batchSize,
            },
          })
        const data = response || []
        const lastItem = data.reduce<TimeEntryViewModel | null>(
          (prev, curr) =>
            !prev || new Date(curr.updatedAt) > new Date(prev.updatedAt)
              ? curr
              : prev,
          null,
        )
        const newCheckpoint: ReplicationCheckpoint = lastItem
          ? { updatedAt: lastItem.updatedAt.toISOString(), id: lastItem.id! }
          : checkpoint!
        const documents: SyncTimeEntryRxDBDTO[] = data.map((item) => ({
          ...item,
          _id: item.id!,
          _deleted: false,
          startDate: item.startDate?.toISOString(),
          endDate: item.endDate?.toISOString(),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }))
        return { documents, checkpoint: newCheckpoint }
      },
      push: async (rows) => {
        return []
      },
    },
    {
      name: 'tasks',
      schema: tasksSyncSchema,
      pull: async (checkpoint, batchSize) => {
        const response: ViewModel<TaskViewModel[]> =
          await client.services.tasks.pull({
            body: {
              workspaceId,
              memberId: '',
              checkpoint: {
                ...checkpoint!,
                updatedAt: new Date(checkpoint!.updatedAt),
              },
              batch: batchSize,
            },
          })
        const data = response.data || []
        const lastItem = data.reduce<TaskViewModel | null>(
          (prev, curr) =>
            !prev || new Date(curr.updatedAt) > new Date(prev.updatedAt)
              ? curr
              : prev,
          null,
        )
        const newCheckpoint: ReplicationCheckpoint = lastItem
          ? { updatedAt: lastItem.updatedAt.toISOString(), id: lastItem.id! }
          : checkpoint!
        const documents: SyncTaskRxDBDTO[] = data.map(
          (item: TaskViewModel) => ({
            _id: item.id,
            _deleted: false,
            id: item.id,
            title: item.title,
            description: item.description,
            url: item.url,
            projectName: item.projectName,
            status: item.status,
            tracker: item.tracker,
            priority: item.priority,
            author: item.author,
            assignedTo: item.assignedTo,
            doneRatio: item.doneRatio,
            spentHours: item.spentHours,
            estimatedTimes: item.estimatedTimes,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            startDate: item.startDate
              ? item.startDate.toISOString()
              : undefined,
            dueDate: item.dueDate ? item.dueDate.toISOString() : undefined,
            statusChanges: item.statusChanges?.map((change) => ({
              fromStatus: change.fromStatus,
              toStatus: change.toStatus,
              description: change.description,
              changedBy: change.changedBy,
              changedAt: change.changedAt.toISOString(),
            })),
            participants: item.participants,
          }),
        )
        return { documents, checkpoint: newCheckpoint }
      },
      push: async (rows) => {
        return []
      },
    },
  ]

  return createStore<SyncStore>((set, get) => ({
    db: null,
    statuses: {},
    isInitialized: false,

    destroy: async () => {
      if (reSyncInterval) clearInterval(reSyncInterval)
      await Promise.all(Object.values(replications).map((rep) => rep.cancel()))
      replications = {}
      const db = get().db
      if (db) await db.close()
      set({ db: null, statuses: {}, isInitialized: false })
    },

    init: async () => {
      if (get().isInitialized) return

      const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode')
      const { RxDBQueryBuilderPlugin } = await import(
        'rxdb/plugins/query-builder'
      )
      addRxPlugin(RxDBDevModePlugin)
      addRxPlugin(RxDBQueryBuilderPlugin)

      const updateStatus = (
        name: keyof AppCollections,
        newStatus: Partial<ReplicationStatus>,
      ) => {
        set((state) => ({
          statuses: {
            ...state.statuses,
            [name]: { ...state.statuses[name], ...newStatus },
          },
        }))
      }

      const db = await createRxDatabase<AppCollections>({
        name: `${workspaceId}-data`,
        storage: wrappedValidateAjvStorage({ storage: getRxStorageDexie() }),
        ignoreDuplicate: true,
        allowSlowCount: true,
      })
      const collectionsToCreate = replicationConfigs.reduce(
        (acc, config) => ({ ...acc, [config.name]: { schema: config.schema } }),
        {} as { [key in keyof AppCollections]: { schema: RxJsonSchema<any> } },
      )
      await db.addCollections(collectionsToCreate)
      set({ db, isInitialized: true })

      for (const config of replicationConfigs) {
        const replication = replicateRxCollection<any, ReplicationCheckpoint>({
          collection: db[config.name],
          replicationIdentifier: `${config.name}-replication-${workspaceId}`,
          live: true,
          retryTime: 10000,
          pull: {
            batchSize: 100,
            initialCheckpoint: (() => {
              const sixtyDaysAgo = new Date()
              sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
              return { updatedAt: sixtyDaysAgo.toISOString(), id: '' }
            })(),
            async handler(checkpoint, batchSize) {
              updateStatus(config.name, { isPulling: true })
              try {
                const result = await config.pull(checkpoint, batchSize)
                updateStatus(config.name, {
                  lastReplication: new Date(),
                  error: null,
                })
                return result
              } catch (err: any) {
                updateStatus(config.name, { error: err })
                return {
                  documents: [],
                  checkpoint: checkpoint || { updatedAt: '', id: '' },
                }
              } finally {
                updateStatus(config.name, { isPulling: false })
              }
            },
          },
          push: {
            batchSize: 100,
            async handler(rows) {
              updateStatus(config.name, { isPushing: true })
              try {
                return await config.push(rows)
              } catch (err: any) {
                updateStatus(config.name, { error: err })
                return []
              } finally {
                updateStatus(config.name, { isPushing: false })
              }
            },
          },
        })

        replications[config.name] = replication
        replication.error$.subscribe((err) =>
          updateStatus(config.name, { error: err }),
        )
        replication.active$.subscribe((isActive) =>
          updateStatus(config.name, { isActive }),
        )
      }

      if (reSyncInterval) clearInterval(reSyncInterval)
      reSyncInterval = setInterval(() => {
        Object.values(replications).forEach((rep) => rep.reSync())
      }, 30 * 1000)
    },
  }))
}

const SyncStoreContext = createContext<StoreApi<SyncStore> | undefined>(
  undefined,
)

interface SyncProviderProps {
  children: ReactNode
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const { workspace } = useWorkspace()
  const client = useClient()
  const storeRef = useRef<StoreApi<SyncStore> | undefined>(undefined)

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
  if (!storeApi) return undefined
  return useStore(storeApi, selector)
}

export const useSyncActions = () => {
  const storeApi = useContext(SyncStoreContext)
  if (!storeApi) return {} as SyncStore
  return storeApi.getState()
}
