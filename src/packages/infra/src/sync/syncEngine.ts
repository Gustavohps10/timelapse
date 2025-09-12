import { IApplicationClient } from '@timelapse/application'
import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { replicateRxCollection } from 'rxdb/plugins/replication'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'

import { timeEntrySchema } from '@/sync/schemas/TimeEntrySchema'

addRxPlugin(RxDBDevModePlugin)

let dbPromise: Promise<RxDatabase> | null = null

async function _createDatabase(
  remoteClient: IApplicationClient,
): Promise<RxDatabase> {
  const db = await createRxDatabase({
    name: 'timelapsedb',
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie(),
    }),
    multiInstance: true,
  })

  await db.addCollections({
    time_entries: {
      schema: timeEntrySchema,
    },
  })

  replicateRxCollection({
    collection: db.time_entries,
    replicationIdentifier: `http-replication-time_entries`,
    push: {
      async handler(docs) {
        console.log(
          'SyncEngine (MOCK): Push handler chamado com',
          docs.length,
          'documentos.',
        )
        // Lógica de push (a ser implementada)
        return Promise.resolve([])
      },
    },
    pull: {
      async handler(lastCheckpoint, batchSize) {
        console.log(
          'SyncEngine (MOCK): Pull handler chamado com o checkpoint:',
          lastCheckpoint,
        )
        // Lógica de pull (a ser implementada)
        return Promise.resolve({
          documents: [],
          checkpoint: lastCheckpoint,
        })
      },
    },
  })

  return db
}

export function getDatabase(
  remoteClient: IApplicationClient,
): Promise<RxDatabase> {
  dbPromise ??= _createDatabase(remoteClient)
  return dbPromise
}
