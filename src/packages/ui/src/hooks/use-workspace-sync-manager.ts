import { TimeEntryViewModel } from '@timelapse/presentation/view-models'
import { useEffect, useRef, useState } from 'react'
import { addRxPlugin, createRxDatabase, RxCollection, RxDatabase } from 'rxdb'
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

type TimeEntriesDB = {
  timeEntries: RxCollection<SyncTimeEntryRxDBDTO>
}

type TimeEntriesCheckpoint = {
  updatedAt: string
  id: string
}

export function useWorkspaceSyncManager() {
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
  const [error, setError] = useState<any>(null)
  const [databaseName, setDatabaseName] = useState<string | null>(null)
  const [collectionName, setCollectionName] = useState<string | null>(null)

  useEffect(() => {
    console.log('isActive:', isActive)
  }, [isActive])

  useEffect(() => {
    console.log('isPulling:', isPulling)
  }, [isPulling])

  useEffect(() => {
    console.log('isPushing:', isPushing)
  }, [isPushing])

  useEffect(() => {
    console.log('lastReplication:', lastReplication)
  }, [lastReplication])

  useEffect(() => {
    console.log('error:', error)
  }, [error])

  useEffect(() => {
    console.log('databaseName:', databaseName)
  }, [databaseName])

  useEffect(() => {
    console.log('collectionName:', collectionName)
  }, [collectionName])

  const initialize = async (workspaceId: string) => {
    //NAO FUNCIONA ARRUMAR DEPOIS
    // if (import.meta.env.MODE !== 'production') {
    //   const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode')
    //   addRxPlugin(RxDBDevModePlugin)
    // }

    const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode')
    addRxPlugin(RxDBDevModePlugin)

    const storage = wrappedValidateAjvStorage({ storage: getRxStorageDexie() })
    const db = await createRxDatabase<TimeEntriesDB>({
      name: `${workspaceId}-data`,
      storage,
      ignoreDuplicate: true,
    })

    const collections = await db.addCollections({
      timeEntries: { schema: timeEntriesSyncSchema, migrationStrategies: {} },
    })

    dbRef.current = db
    setDatabaseName(db.name)
    setCollectionName('timeEntries')

    const replication = replicateRxCollection<
      SyncTimeEntryRxDBDTO,
      TimeEntriesCheckpoint
    >({
      collection: collections.timeEntries,
      replicationIdentifier: `time-entries-replication-${workspaceId}`,
      pull: {
        batchSize: 100,
        initialCheckpoint: (() => {
          const sixtyDaysAgo = new Date()
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
          return {
            updatedAt: sixtyDaysAgo.toISOString(),
            id: '',
          }
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

            console.log('replicating pull response', response)
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

            return {
              documents,
              checkpoint: newCheckpoint,
            }
          } finally {
            setIsPulling(false)
          }
        },
      },
      push: {
        async handler(changeRows) {
          setIsPushing(true)
          try {
            return []
          } finally {
            setIsPushing(false)
          }
        },
      },
      live: true,
      retryTime: 5000,
      // waitForLeadership: false,
      // autoStart: true,
    })

    replicationRef.current = replication
    replication.active$.subscribe(setIsActive)
    replication.error$.subscribe(setError)
  }

  const stop = () => {
    replicationRef.current?.cancel()
    setIsActive(false)
    setIsPulling(false)
    setIsPushing(false)
  }

  return {
    isActive,
    isPulling,
    isPushing,
    lastReplication,
    error,
    databaseName,
    collectionName,
    initialize,
    stop,
  }
}
