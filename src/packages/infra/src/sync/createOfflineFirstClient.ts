import { IApplicationClient } from '@timelapse/application'
import { AppError, Either } from '@timelapse/cross-cutting/helpers'
import { TimeEntryViewModel } from '@timelapse/presentation/view-models'
import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

import { timeEntrySchema, workspaceSchema } from '@/sync/schemas'
import { TimeEntryDoc } from '@/sync/types'

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

/** ViewModel -> Doc (ensures all IDs saved as strings and dates as ISO strings) */
function toDoc(view: TimeEntryViewModel): TimeEntryDoc {
  const projectId = view.project?.id ?? 0
  const issueId = view.issue?.id ?? 0
  const userId = view.user?.id ?? 0
  const activityId = view.activity?.id ?? 0

  return {
    id: String(view.id ?? Date.now()),
    taskId: view.taskId ? String(view.taskId) : '',
    project: {
      id: String(projectId),
      name: view.project?.name ?? '',
    },
    issue: {
      id: String(issueId),
    },
    user: {
      id: String(userId),
      name: view.user?.name ?? '',
    },
    activity: {
      id: String(activityId),
      name: view.activity?.name ?? '',
    },
    hours: view.hours ?? 0,
    comments: view.comments ?? '',
    spentOn: view.spentOn
      ? view.spentOn.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    createdAt: view.createdAt
      ? view.createdAt.toISOString()
      : new Date().toISOString(),
    updatedAt: view.updatedAt
      ? view.updatedAt.toISOString()
      : new Date().toISOString(),
    _deleted: false,
  }
}

/** Doc -> ViewModel (converts stored strings back to UI types: numbers & Date) */
function toViewModel(doc: TimeEntryDoc): TimeEntryViewModel {
  return {
    id: Number(doc.id),
    taskId: doc.taskId || undefined,
    project: {
      id: Number(doc.project.id),
      name: doc.project.name,
    },
    issue: {
      id: Number(doc.issue.id),
    },
    user: {
      id: Number(doc.user.id),
      name: doc.user.name,
    },
    activity: {
      id: Number(doc.activity.id),
      name: doc.activity.name,
    },
    hours: doc.hours,
    comments: doc.comments,
    spentOn: doc.spentOn ? new Date(doc.spentOn) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }
}

export async function createOfflineFirstClient(
  remoteClient: IApplicationClient,
): Promise<Either<AppError, IApplicationClient>> {
  try {
    const db = await initializeDb()

    const localFirstTimeEntriesService: typeof remoteClient.services.timeEntries =
      {
        async findByMemberId(payload) {
          const { memberId, startDate, endDate } = payload.body

          try {
            const remoteResult =
              await remoteClient.services.timeEntries.findByMemberId({
                body: payload.body,
              })

            if (remoteResult.data && Array.isArray(remoteResult.data)) {
              const documentsToInsert = remoteResult.data.map((raw) =>
                toDoc({
                  // map remote raw into ViewModel-like shape before toDoc
                  id: raw.id as number | string,
                  taskId: raw.taskId ? String(raw.taskId) : undefined,
                  project: {
                    id: raw.project?.id ?? 0,
                    name: raw.project?.name ?? '',
                  },
                  issue: { id: raw.issue?.id ?? 0 },
                  user: { id: raw.user?.id ?? 0, name: raw.user?.name ?? '' },
                  activity: {
                    id: raw.activity?.id ?? 0,
                    name: raw.activity?.name ?? '',
                  },
                  hours: raw.hours ?? 0,
                  comments: raw.comments ?? '',
                  spentOn: raw.spentOn ? new Date(raw.spentOn) : undefined,
                  createdAt: raw.createdAt
                    ? new Date(raw.createdAt)
                    : undefined,
                  updatedAt: raw.updatedAt
                    ? new Date(raw.updatedAt)
                    : undefined,
                } as TimeEntryViewModel),
              )

              await db.time_entries.bulkUpsert(documentsToInsert)
            }
          } catch (err) {
            console.error('❌ [SYNC] Erro ao sincronizar do remoto:', err)
          }

          const start = new Date(startDate).toISOString().split('T')[0]
          const end = new Date(endDate).toISOString().split('T')[0]
          const memberIdString = String(memberId)

          const query = db.time_entries.find({
            selector: {
              'user.id': { $eq: memberIdString },
              spentOn: { $gte: start, $lte: end },
            },
          })

          const docs = await query.exec()

          const localTimeEntries: TimeEntryViewModel[] = docs.map((d) =>
            toViewModel(d.toJSON() as TimeEntryDoc),
          )

          const result = {
            data: localTimeEntries,
            totalItems: docs.length,
            totalPages: 1,
            currentPage: 1,
            isSuccess: true,
            statusCode: 200,
          }
          return result
        },
      }

    const offlineClient: IApplicationClient = {
      ...remoteClient,
      services: {
        ...remoteClient.services,
        timeEntries: localFirstTimeEntriesService,
      },
    }

    return Either.success(offlineClient)
  } catch (error) {
    return Either.failure(
      new AppError(
        'OFFLINE_CLIENT_ERROR',
        error instanceof Error
          ? error.message
          : 'Erro ao criar cliente offline-first',
        500,
      ),
    )
  }
}
