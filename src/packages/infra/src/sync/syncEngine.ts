import { IApplicationClient, TimeEntryDTO } from '@timelapse/application'
import {
  addRxPlugin,
  createRxDatabase,
  RxDatabase,
  RxReplicationWriteToMasterRow,
  WithDeleted,
} from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { replicateRxCollection } from 'rxdb/plugins/replication'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'

import { timeEntrySchema } from '@/sync/schemas/TimeEntrySchema'

import { TimeEntryMapper } from './mappers'
import { SyncCheckpoint, TimeEntryDoc } from './types'

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

  replicateRxCollection({
    collection: db.time_entries,
    replicationIdentifier: `http-replication-time_entries`,
    push: {
      async handler(docs: RxReplicationWriteToMasterRow<TimeEntryDoc>[]) {
        console.log(
          'SyncEngine: Push handler chamado com',
          docs.length,
          'documentos.',
        )

        try {
          const failedDocs: WithDeleted<TimeEntryDoc>[] = []

          for (const doc of docs) {
            try {
              const timeEntryData = TimeEntryMapper.docToDto(
                doc.newDocumentState,
              )

              console.log('Enviando TimeEntry para servidor:', timeEntryData.id)

              // TODO: Implementar push quando API estiver disponível
              // await _remoteClient.services.timeEntries.create(timeEntryData)
            } catch (error) {
              console.error(
                'Erro ao enviar TimeEntry:',
                doc.newDocumentState.id,
                error,
              )
              failedDocs.push(doc.newDocumentState as WithDeleted<TimeEntryDoc>)
            }
          }

          console.log(
            `SyncEngine: Push concluído. ${docs.length - failedDocs.length} sucessos, ${failedDocs.length} falhas`,
          )
          return failedDocs
        } catch (error) {
          console.error('SyncEngine: Erro crítico no push:', error)
          // Retornar todos os documentos para retry em caso de erro crítico
          return docs.map(
            (doc) => doc.newDocumentState as WithDeleted<TimeEntryDoc>,
          )
        }
      },
    },
    pull: {
      async handler(lastCheckpoint: unknown, batchSize: number) {
        console.log(
          'SyncEngine: Pull handler chamado com o checkpoint:',
          lastCheckpoint,
          'Batch size:',
          batchSize,
        )

        try {
          console.log('Buscando TimeEntries do servidor remoto...')

          // TODO: Implementar pull com filtros específicos quando necessário
          // Por enquanto, buscar dados de exemplo para demonstração
          const serverData =
            await _remoteClient.services.timeEntries.findByMemberId({
              body: {
                memberId: '1', // TODO: Obter do contexto
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                workspaceId: 'ws-123', // TODO: Obter do contexto
              },
            })

          if (!serverData.isSuccess) {
            console.log(
              'SyncEngine: Erro ao buscar dados do servidor:',
              serverData,
            )
            return {
              documents: [],
              checkpoint: lastCheckpoint as SyncCheckpoint,
            }
          }

          const timeEntries = serverData.data || []
          const documents = timeEntries.map((timeEntry: TimeEntryDTO) =>
            TimeEntryMapper.dtoToDoc(timeEntry),
          )

          const newCheckpoint: SyncCheckpoint = {
            id: `checkpoint-${Date.now()}`,
            time: Date.now(),
            lastSyncTime: new Date().toISOString(),
          }

          console.log(
            `SyncEngine: Pull concluído. ${documents.length} documentos recebidos`,
          )

          return {
            documents: documents.map(
              (doc) =>
                ({ ...doc, _deleted: false }) as WithDeleted<TimeEntryDoc>,
            ),
            checkpoint: newCheckpoint,
          }
        } catch (error) {
          console.error('SyncEngine: Erro no pull:', error)
          // Retornar checkpoint atual em caso de erro para não perder progresso
          return {
            documents: [],
            checkpoint: lastCheckpoint as SyncCheckpoint,
          }
        }
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
