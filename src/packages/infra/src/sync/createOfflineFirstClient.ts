import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

import { timeEntrySchema, workspaceSchema } from '@/sync/schemas'

addRxPlugin(RxDBQueryBuilderPlugin)

if (process.env.NODE_ENV !== 'production') {
  import('rxdb/plugins/dev-mode').then((module) => {
    addRxPlugin(module.RxDBDevModePlugin)
  })
}

let dbInstance: RxDatabase | null = null

const initializeDb = async () => {
  if (dbInstance) return dbInstance

  const db = await createRxDatabase({
    name: 'timelapsedb',
    storage: getRxStorageDexie(),
    multiInstance: false,
  })

  await db.addCollections({
    workspaces: { schema: workspaceSchema },
    time_entries: { schema: timeEntrySchema },
  })

  dbInstance = db
  return dbInstance
}
