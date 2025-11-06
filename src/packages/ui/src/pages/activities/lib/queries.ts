import { MangoQuery, MangoQuerySortPart } from 'rxdb'

import {
  SyncMetadataItem,
  SyncMetadataRxDBDTO,
} from '@/db/schemas/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'
import { AppDatabase } from '@/stores/syncStore'

type SortDescriptor = {
  id: keyof SyncTaskRxDBDTO
  desc: boolean
}

export interface GetTasksSchema {
  page: number
  perPage: number
  sort: SortDescriptor[]
  title?: string
  status: string[]
  priority: string[]
  createdAt: string[]
  estimatedHours: number[]
}

function getUserTaskSelector(userId: string): MangoQuery<SyncTaskRxDBDTO> {
  return {
    selector: {
      _deleted: { $ne: true },
      $or: [
        { 'author.id': { $eq: userId } },
        { 'assignedTo.id': { $eq: userId } },
        { participants: { $elemMatch: { id: userId } } },
      ],
    },
  }
}

/**
 * Busca todas as tarefas de um usuário (para agregações).
 */
async function getAllUserTasks(
  db: AppDatabase,
  userId: string,
): Promise<SyncTaskRxDBDTO[]> {
  const { selector } = getUserTaskSelector(userId)
  const allDocs = await db.tasks.find({ selector }).exec()

  // Converte DeepReadonlyObject[] para SyncTaskRxDBDTO[]
  const readonlyData = allDocs.map((doc) => doc.toJSON())
  return JSON.parse(JSON.stringify(readonlyData)) as SyncTaskRxDBDTO[]
}

/**
 * Busca os metadados (status, prioridades) do schema de metadata.
 */
async function getMetadata(
  db: AppDatabase,
): Promise<SyncMetadataRxDBDTO | undefined> {
  const metadataDoc = await db.metadata.findOne().exec()
  if (!metadataDoc) {
    return undefined
  }

  // Converte DeepReadonlyObject para SyncMetadataRxDBDTO
  const readonlyData = metadataDoc.toJSON()
  return JSON.parse(JSON.stringify(readonlyData)) as SyncMetadataRxDBDTO
}

export async function getTasks(
  db: AppDatabase,
  userId: string,
  input: GetTasksSchema,
) {
  try {
    const offset = (input.page - 1) * input.perPage

    const { selector: userSelector } = getUserTaskSelector(userId)

    const selector: MangoQuery<SyncTaskRxDBDTO>['selector'] = {
      ...userSelector,
    }

    if (input.title) {
      // CORREÇÃO: O tipo $regex do RxDB espera uma string.
      // Usamos '(?i)' no início da string para habilitar case-insensitivity.
      selector.title = { $regex: '(?i)' + input.title }
    }

    if (input.status?.length > 0) {
      selector['status.name'] = { $in: input.status }
    }

    if (input.priority?.length > 0) {
      selector['priority.name'] = { $in: input.priority }
    }
    if (input.createdAt?.length === 2) {
      selector.createdAt = {
        $gte: new Date(input.createdAt[0]).toISOString(),
        $lte: new Date(input.createdAt[1]).toISOString(),
      }
    }

    const sort: MangoQuerySortPart<SyncTaskRxDBDTO>[] =
      input.sort.length > 0
        ? input.sort.map((item) => ({
            [item.id]: item.desc ? 'desc' : 'asc',
          }))
        : [{ updatedAt: 'desc' }]

    const tasksDocs = await db.tasks
      .find({
        selector,
        sort,
        skip: offset,
        limit: input.perPage,
      })
      .exec()

    const total = await db.tasks
      .count({
        selector,
      })
      .exec()

    const pageCount = Math.ceil(total / input.perPage)

    const data = JSON.parse(
      JSON.stringify(tasksDocs.map((doc) => doc.toJSON())),
    ) as SyncTaskRxDBDTO[]

    return { data, pageCount }
  } catch (err) {
    console.error('Error fetching tasks from RxDB:', err)
    return { data: [], pageCount: 0 }
  }
}

export async function getTaskStatusCounts(db: AppDatabase, userId: string) {
  const [tasks, metadata] = await Promise.all([
    getAllUserTasks(db, userId),
    getMetadata(db),
  ])

  const counts: Record<string, number> = {}
  metadata?.taskStatuses.forEach((status: SyncMetadataItem) => {
    counts[status.name] = 0
  })

  for (const task of tasks) {
    if (counts[task.status.name] !== undefined) {
      counts[task.status.name]++
    }
  }
  return counts
}

export async function getTaskPriorityCounts(db: AppDatabase, userId: string) {
  const [tasks, metadata] = await Promise.all([
    getAllUserTasks(db, userId),
    getMetadata(db),
  ])

  const counts: Record<string, number> = {}
  metadata?.taskPriorities.forEach((priority: SyncMetadataItem) => {
    counts[priority.name] = 0
  })

  for (const task of tasks) {
    if (task.priority && counts[task.priority.name] !== undefined) {
      counts[task.priority.name]++
    }
  }
  return counts
}

export async function getEstimatedHoursRange(db: AppDatabase, userId: string) {
  const tasks = await getAllUserTasks(db, userId)
  if (tasks.length === 0) return { min: 0, max: 0 }

  let min = 0
  let max = 0
  let firstRun = true

  for (const task of tasks) {
    const totalEstimated =
      task.estimatedTimes?.reduce((acc, curr) => acc + curr.hours, 0) || 0

    if (firstRun) {
      min = totalEstimated
      max = totalEstimated
      firstRun = false
    } else {
      if (totalEstimated < min) min = totalEstimated
      if (totalEstimated > max) max = totalEstimated
    }
  }

  return { min, max }
}

export async function getAllStati(db: AppDatabase) {
  const metadata = await getMetadata(db)
  return metadata?.taskStatuses || []
}

export async function getAllPriorities(db: AppDatabase) {
  const metadata = await getMetadata(db)
  return metadata?.taskPriorities || []
}
