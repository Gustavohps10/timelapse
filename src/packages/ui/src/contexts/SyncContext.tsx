'use client'

import {
  MetadataViewModel,
  TaskViewModel,
  TimeEntryViewModel,
  ViewModel,
} from '@timelapse/presentation/view-models'
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { addRxPlugin, createRxDatabase } from 'rxdb'
import {
  replicateRxCollection,
  RxReplicationState,
} from 'rxdb/plugins/replication'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'

import { useClient } from '@/hooks/use-client'
import {
  metadataSyncSchema,
  SyncMetadataRxDBDTO,
} from '@/sync/metadata-sync-schema'
import {
  AppCollections,
  AppDatabase,
  ReplicationCheckpoint,
  ReplicationConfig,
  ReplicationStatus,
  SyncContextValue,
} from '@/sync/sync-types'
import { SyncTaskRxDBDTO, tasksSyncSchema } from '@/sync/tasks-sync-schema'
import {
  SyncTimeEntryRxDBDTO,
  timeEntriesSyncSchema,
} from '@/sync/time-entries-sync-schema'

export const SyncContext = createContext<SyncContextValue | undefined>(
  undefined,
)

interface SyncProviderProps {
  children: ReactNode
  workspaceId: string
}

export const SyncProvider: React.FC<SyncProviderProps> = ({
  children,
  workspaceId,
}) => {
  const client = useClient()
  const dbRef = useRef<AppDatabase | null>(null)
  const replicationsRef = useRef<Record<string, RxReplicationState<any, any>>>(
    {},
  )
  const reSyncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [statuses, setStatuses] = useState<Record<string, ReplicationStatus>>(
    {},
  )

  const updateStatus = useCallback(
    (name: keyof AppCollections, newStatus: Partial<ReplicationStatus>) => {
      setStatuses((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          ...newStatus,
        },
      }))
    },
    [],
  )

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

  const startAllReplications = useCallback(async () => {
    if (!dbRef.current || Object.keys(replicationsRef.current).length > 0) {
      return
    }
    console.log('🚀 Starting all replications...')
    for (const config of replicationConfigs) {
      const collection = dbRef.current.collections[config.name]
      const replication = replicateRxCollection<any, ReplicationCheckpoint>({
        collection,
        replicationIdentifier: `${config.name}-replication-${workspaceId}`,
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
              const result = await config.pull(checkpoint!, batchSize)
              console.log(
                `Pulled ${result.documents.length} documents for ${config.name}`,
              )
              updateStatus(config.name, { lastReplication: new Date() })
              return result
            } catch (err: any) {
              console.error(`Pull error for ${config.name}:`, err)
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
              console.error(`Push error for ${config.name}:`, err)
              updateStatus(config.name, { error: err })
              return []
            } finally {
              updateStatus(config.name, { isPushing: false })
            }
          },
        },
        live: true,
        retryTime: 10000,
      })
      replicationsRef.current[config.name] = replication
      replication.error$.subscribe((err) =>
        updateStatus(config.name, { error: err }),
      )
      replication.active$.subscribe((isActive) =>
        updateStatus(config.name, { isActive }),
      )
    }

    if (reSyncIntervalRef.current) clearInterval(reSyncIntervalRef.current)
    reSyncIntervalRef.current = setInterval(() => {
      console.log('🔄 Triggering periodic re-sync for all replications...')
      Object.values(replicationsRef.current).forEach((rep) => rep.reSync())
    }, 30 * 1000)
  }, [workspaceId, client, updateStatus])

  const stopAllReplications = useCallback(() => {
    if (reSyncIntervalRef.current) {
      clearInterval(reSyncIntervalRef.current)
      reSyncIntervalRef.current = null
    }
    Object.values(replicationsRef.current).forEach((replication) =>
      replication.cancel(),
    )
    replicationsRef.current = {}
    setStatuses({})
    console.log('🛑 All replications stopped.')
  }, [])

  useEffect(() => {
    const initDatabase = async () => {
      const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode')
      const { RxDBQueryBuilderPlugin } = await import(
        'rxdb/plugins/query-builder'
      )
      addRxPlugin(RxDBDevModePlugin)
      addRxPlugin(RxDBQueryBuilderPlugin)

      const storage = wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
      })
      const db = await createRxDatabase<AppCollections>({
        name: `${workspaceId}-data`,
        storage,
        ignoreDuplicate: true,
      })

      const collectionsToCreate = replicationConfigs.reduce((acc, config) => {
        acc[config.name] = { schema: config.schema }
        return acc
      }, {} as any)

      await db.addCollections(collectionsToCreate)
      dbRef.current = db
    }

    initDatabase()

    return () => {
      stopAllReplications()
      if (dbRef.current) {
        dbRef.current.close()
        dbRef.current = null
      }
    }
  }, [workspaceId, stopAllReplications])

  return (
    <SyncContext.Provider
      value={{
        db: dbRef.current,
        statuses,
        startAllReplications,
        stopAllReplications,
      }}
    >
      {children}
    </SyncContext.Provider>
  )
}
