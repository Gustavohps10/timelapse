// src/contexts/SyncProvider.tsx
import {
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

  // Um único estado para gerenciar o status de todas as replicações
  const [statuses, setStatuses] = useState<Record<string, ReplicationStatus>>(
    {},
  )

  // Centraliza a atualização de status para uma entidade específica
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

  // --- CONFIGURAÇÃO DAS ENTIDADES SINCRONIZÁVEIS ---
  const replicationConfigs: ReplicationConfig<any, ReplicationCheckpoint>[] = [
    {
      name: 'timeEntries',
      schema: timeEntriesSyncSchema,
      pull: async (checkpoint, batchSize) => {
        const response: TimeEntryViewModel[] =
          await client.services.timeEntries.pull({
            body: {
              workspaceId,
              memberId: '', // TODO: Obter o ID do membro logado
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
        return [] // Retorna os conflitos
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
              memberId: '', // TODO: Obter o ID do membro logado
              checkpoint: {
                ...checkpoint!,
                updatedAt: new Date(checkpoint!.updatedAt),
              },
              batch: batchSize,
            },
          })

        console.log(
          'Pulling tasks with checkpoint:',
          checkpoint,
          'and batchSize:',
          batchSize,
        )
        console.log('Pulled tasks response:', response)
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

        // Supondo que 'data' é o array que veio da sua API do Redmine
        const documents: SyncTaskRxDBDTO[] = data.map((item) => ({
          _id: item.id,
          _deleted: false,
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.url,
          project: item.projectName ? { name: item.projectName } : undefined,
          status: item.status,
          priority: item.priority,
          author: item.author,
          assignedTo: item.assignedTo,
          doneRatio: item.doneRatio,
          spentHours: item.spentHours,
          estimatedTime: item.estimatedTime,

          // --- AQUI ESTÁ A CORREÇÃO ---
          // Se 'item.createdAt' já é um objeto Date, chame .toISOString() diretamente.
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),

          // Trata as datas opcionais para evitar erros
          startDate: item.startDate ? item.startDate.toISOString() : undefined,
          dueDate: item.dueDate ? item.dueDate.toISOString() : undefined,

          statusChanges: item.statusChanges?.map((change) => ({
            fromStatus: change.fromStatus,
            toStatus: change.toStatus,
            changedBy: change.changedBy,
            // Mantém a conversão que já estava correta
            changedAt: change.changedAt.toISOString(),
          })),
        }))

        // Agora 'documents' está no formato correto para o RxDB
        // return { documents, checkpoint: newCheckpoint }

        return { documents, checkpoint: newCheckpoint }
      },
      push: async (rows) => {
        return []
      },
    },
    // Adicione a configuração de futuras entidades aqui
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
              // Para evitar loop de retry, retornamos o checkpoint antigo
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
              return [] // Não reenviar em caso de erro
            } finally {
              updateStatus(config.name, { isPushing: false })
            }
          },
        },
        live: true,
        retryTime: 10000, // Aumentado para evitar spam em caso de erro
      })

      replicationsRef.current[config.name] = replication

      replication.error$.subscribe((err) =>
        updateStatus(config.name, { error: err }),
      )
      replication.active$.subscribe((isActive) =>
        updateStatus(config.name, { isActive }),
      )
    }

    // Inicia o re-sync periódico
    if (reSyncIntervalRef.current) clearInterval(reSyncIntervalRef.current)
    reSyncIntervalRef.current = setInterval(() => {
      console.log('🔄 Triggering periodic re-sync for all replications...')
      Object.values(replicationsRef.current).forEach((rep) => rep.reSync())
    }, 30 * 1000) // 30 segundos
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
    setStatuses({}) // Reseta todos os status
    console.log('🛑 All replications stopped.')
  }, [])

  useEffect(() => {
    const initDatabase = async () => {
      // Plugins do RxDB (import dinâmico)
      const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode')
      const { RxDBQueryBuilderPlugin } = await import(
        'rxdb/plugins/query-builder'
      )
      addRxPlugin(RxDBDevModePlugin)
      addRxPlugin(RxDBQueryBuilderPlugin)

      const storage = wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
      })

      // Cria o banco de dados
      const db = await createRxDatabase<AppCollections>({
        name: `${workspaceId}-data`,
        storage,
        ignoreDuplicate: true,
      })

      // Mapeia as configurações para o formato que addCollections espera
      const collectionsToCreate = replicationConfigs.reduce((acc, config) => {
        acc[config.name] = { schema: config.schema }
        return acc
      }, {} as any)

      // Adiciona todas as coleções de uma vez
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
