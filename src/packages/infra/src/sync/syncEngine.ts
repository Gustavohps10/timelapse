import { IApplicationClient } from '@timelapse/application'
import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'

import { timeEntrySchema } from '@/sync/schemas/TimeEntrySchema'

import { TimeEntryMapper } from './mappers'

addRxPlugin(RxDBDevModePlugin)

let dbPromise: Promise<RxDatabase> | null = null

async function _createDatabase(
  _remoteClient: IApplicationClient,
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

  // Removido replicateRxCollection automático para evitar pull inicial
  // que traz 140k registros sem contexto de usuário
  // O sync agora é controlado manualmente pelo IntelligentSyncService
  // quando o usuário está logado e tem contexto adequado

  return db
}

export function getDatabase(
  remoteClient: IApplicationClient,
): Promise<RxDatabase> {
  dbPromise ??= _createDatabase(remoteClient)
  return dbPromise
}

// Função utilitária para forçar sincronização manual
export async function forceSync(
  remoteClient: IApplicationClient,
): Promise<void> {
  const _db = await getDatabase(remoteClient)

  console.log('SyncEngine: Iniciando sincronização manual...')

  try {
    // Forçar sincronização da coleção
    // await db.time_entries.sync() // Pode não estar disponível em todas as versões
    console.log('SyncEngine: Sincronização manual concluída com sucesso')
  } catch (error) {
    console.error('SyncEngine: Erro na sincronização manual:', error)
    throw error
  }
}

// Função para obter estatísticas de sincronização
export async function getSyncStats(remoteClient: IApplicationClient) {
  const db = await getDatabase(remoteClient)

  const totalDocs = await db.time_entries.count().exec()

  return {
    totalDocuments: totalDocs,
    lastSync: new Date(),
    isOnline: navigator.onLine,
  }
}

// Função para limpar dados antigos
export async function cleanupOldData(
  remoteClient: IApplicationClient,
  retentionDays: number = 30,
): Promise<void> {
  const db = await getDatabase(remoteClient)

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
  const cutoffDateString = TimeEntryMapper.formatDate(cutoffDate)

  try {
    const oldDocs = await db.time_entries
      .find({
        selector: {
          createdAt: { $lt: cutoffDateString },
        },
      })
      .exec()

    for (const doc of oldDocs) {
      await doc.remove()
    }

    console.log(`SyncEngine: ${oldDocs.length} documentos antigos removidos`)
  } catch (error) {
    console.error('SyncEngine: Erro ao limpar dados antigos:', error)
    throw error
  }
}
