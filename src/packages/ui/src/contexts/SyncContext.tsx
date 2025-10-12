import { TimeEntryViewModel } from '@timelapse/presentation/view-models'
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
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

import { useClient } from '@/hooks/use-client'
import {
  SyncTimeEntryRxDBDTO,
  timeEntriesSyncSchema,
} from '@/sync/time-entries-sync-schema'

// --- 1. Interface do Contexto Atualizada ---
// Trocamos 'initialize' e 'stop' por funções mais específicas
// e tipamos o erro corretamente.
export interface SyncContextValue {
  isActive: boolean
  isPulling: boolean
  isPushing: boolean
  lastReplication: Date | null
  error: Error | RxError | null // Tipagem mais segura que 'any'
  databaseName: string | null
  collectionName: string | null
  timeEntriesCollection: RxCollection<SyncTimeEntryRxDBDTO> | null
  startReplication: () => Promise<void>
  stopReplication: () => void
}

export const SyncContext = createContext<SyncContextValue | undefined>(
  undefined,
)

type TimeEntriesDB = {
  timeEntries: RxCollection<SyncTimeEntryRxDBDTO>
}

type TimeEntriesCheckpoint = {
  updatedAt: string
  id: string
}

interface SyncProviderProps {
  children: ReactNode
  workspaceId: string
}

export const SyncProvider: React.FC<SyncProviderProps> = ({
  children,
  workspaceId,
}) => {
  const client = useClient()
  const dbRef = useRef<RxDatabase<TimeEntriesDB> | null>(null)
  const replicationRef = useRef<RxReplicationState<
    SyncTimeEntryRxDBDTO,
    TimeEntriesCheckpoint
  > | null>(null)

  const [isActive, setIsActive] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [lastReplication, setLastReplication] = useState<Date | null>(null)
  const [error, setError] = useState<Error | RxError | null>(null) // State de erro tipado
  const [databaseName, setDatabaseName] = useState<string | null>(null)
  const [collectionName, setCollectionName] = useState<string | null>(null)
  const [timeEntriesCollection, setTimeEntriesCollection] =
    useState<RxCollection<SyncTimeEntryRxDBDTO> | null>(null)

  // --- 2. Lógica de Replicação Separada ---
  const startReplication = useCallback(async () => {
    // Impede múltiplas replicações ou iniciar sem o DB
    if (!dbRef.current || replicationRef.current) {
      return
    }

    const replication = replicateRxCollection<
      SyncTimeEntryRxDBDTO,
      TimeEntriesCheckpoint
    >({
      collection: dbRef.current.collections.timeEntries,
      replicationIdentifier: `time-entries-replication-${workspaceId}`,
      pull: {
        batchSize: 100,
        initialCheckpoint: (() => {
          const sixtyDaysAgo = new Date()
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
          return { updatedAt: sixtyDaysAgo.toISOString(), id: '' }
        })(),
        async handler(checkpoint, batchSize) {
          setIsPulling(true)
          try {
            const response = await client.services.timeEntries.pull({
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

            const newCheckpoint: TimeEntriesCheckpoint = lastItem
              ? {
                  updatedAt: lastItem.updatedAt.toISOString(),
                  id: lastItem.id ?? checkpoint!.id,
                }
              : checkpoint!

            const documents = data.map((item) => ({
              ...item,
              _id: item.id!,
              _deleted: false,
              startDate: item.startDate?.toISOString(),
              endDate: item.endDate?.toISOString(),
              createdAt: item.createdAt.toISOString(),
              updatedAt: item.updatedAt.toISOString(),
            }))

            setLastReplication(new Date())
            return { documents, checkpoint: newCheckpoint }
          } finally {
            setIsPulling(false)
          }
        },
      },
      push: {
        batchSize: 100,
        async handler(changeRows) {
          setIsPushing(true)
          try {
            console.log('Pushing changes:', changeRows)
            return [] // Retorna os documentos que falharam (se houver)
          } finally {
            setIsPushing(false)
          }
        },
      },
      live: true,
      retryTime: 5000,
    })

    replicationRef.current = replication
    replication.error$.subscribe(setError)
    replication.active$.subscribe(setIsActive)
  }, [workspaceId, client])

  const stopReplication = useCallback(() => {
    if (replicationRef.current) {
      replicationRef.current.cancel()
      replicationRef.current = null
    }
    setIsActive(false)
    setIsPulling(false)
    setIsPushing(false)
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
      const db = await createRxDatabase<TimeEntriesDB>({
        name: `${workspaceId}-data`,
        storage,
        ignoreDuplicate: true,
      })

      const collections = await db.addCollections({
        timeEntries: { schema: timeEntriesSyncSchema },
      })

      dbRef.current = db
      setDatabaseName(db.name)
      setCollectionName('timeEntries')
      setTimeEntriesCollection(collections.timeEntries)
    }

    initDatabase()

    return () => {
      stopReplication()
      if (dbRef.current) {
        dbRef.current.close()
        dbRef.current = null
      }
    }
  }, [workspaceId, stopReplication])

  return (
    <SyncContext.Provider
      value={{
        isActive,
        isPulling,
        isPushing,
        lastReplication,
        error,
        databaseName,
        collectionName,
        timeEntriesCollection,
        startReplication,
        stopReplication,
      }}
    >
      {children}
    </SyncContext.Provider>
  )
}
