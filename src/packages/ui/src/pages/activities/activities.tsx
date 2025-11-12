'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { Board } from '@/components/dnd/board'
import { TBoard, TCard, TColumn } from '@/components/dnd/data'
import { SyncMetadataRxDBDTO } from '@/db/schemas/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'
import { useAuth } from '@/hooks'
import { useSyncStore } from '@/stores/syncStore'

type TaskWithTimeEntries = SyncTaskRxDBDTO & { timeEntries: any[] }

/**
 * Esta é a sua página principal.
 * Ela busca os dados e os passa para o componente <Board>.
 */
export function Activities() {
  const db = useSyncStore((state) => state.db)
  const { user } = useAuth()

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async (): Promise<TaskWithTimeEntries[]> => {
      if (!db || !user?.id) return []

      const tasksDocs = await db.tasks
        .find({
          selector: { _deleted: { $ne: true } },
        })
        .limit(100)
        .exec()

      const tasksWithTimeEntries = await Promise.all(
        tasksDocs.map(async (task) => {
          const taskObj = task.toJSON()
          const timeEntriesDocs = await db.timeEntries
            .find({
              selector: {
                _deleted: { $ne: true },
                'task.id': { $eq: taskObj.id },
              },
            })
            .exec()
          return {
            ...taskObj,
            timeEntries: timeEntriesDocs.map((te) => te.toJSON()),
          }
        }),
      )
      return JSON.parse(JSON.stringify(tasksWithTimeEntries))
    },
    enabled: !!db && !!user?.id,
  })

  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: async (): Promise<SyncMetadataRxDBDTO | null> => {
      if (!db) return null
      const metadataDoc = await db.metadata.findOne().exec()
      return metadataDoc
        ? JSON.parse(JSON.stringify(metadataDoc.toJSON()))
        : null
    },
    enabled: !!db,
  })

  const initialBoard: TBoard | null = useMemo(() => {
    if (!tasks || !metadata) {
      return null
    }

    const taskMap = new Map<string, TCard[]>()

    for (const status of metadata.taskStatuses) {
      taskMap.set(status.name, [])
    }

    for (const task of tasks) {
      const statusName = task.status.name
      if (taskMap.has(statusName)) {
        const card: TCard = {
          task: task as SyncTaskRxDBDTO,
          metadata: metadata,
        }
        taskMap.get(statusName)!.push(card)
      }
    }

    const columns: TColumn[] = metadata.taskStatuses.map((status) => ({
      id: status.name,
      title: status.name,
      cards: taskMap.get(status.name) || [],
    }))

    return { columns }
  }, [tasks, metadata])

  if (isLoadingTasks || isLoadingMetadata || !initialBoard) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground mt-10">Carregando atividades...</p>
      </div>
    )
  }

  return (
    <div className="w-[calc(100vw-300px-72px-2rem)] flex-1 cursor-grab overflow-auto rounded-md border select-none active:cursor-grabbing">
      <Board initial={initialBoard} />
    </div>
  )
}
