'use client'

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { WorkspaceViewModel } from '@timelapse/presentation/view-models'
import { Suspense, useCallback } from 'react'
import { RxDocument } from 'rxdb'
import { toast } from 'sonner'

import { User } from '@/@types/session/User'
import { Board } from '@/components/dnd/board'
import { TBoard, TCard, TColumn } from '@/components/dnd/data'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { KanbanColumnRxDBDTO } from '@/db/schemas/kanban-column-schema'
import { TaskKanbanColumnRxDBDTO } from '@/db/schemas/kanban-task-columns-schema'
import { SyncMetadataRxDBDTO } from '@/db/schemas/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'
import { SyncTimeEntryRxDBDTO } from '@/db/schemas/time-entries-sync-schema'
import { useAuth, useWorkspace } from '@/hooks'
import { AppDatabase, useSyncStore } from '@/stores/syncStore'

type TaskWithTimeEntries = SyncTaskRxDBDTO & { timeEntries: any[] }

function KanbanSkeleton() {
  return (
    <div className="grid h-full w-full auto-cols-[300px] grid-flow-col gap-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function KanbanBoard({
  db,
  user,
  workspace,
}: {
  db: AppDatabase
  user: User
  workspace: WorkspaceViewModel
}) {
  const queryClient = useQueryClient()

  const { data: tasks } = useSuspenseQuery({
    queryKey: ['tasks', user.id],
    queryFn: async (): Promise<TaskWithTimeEntries[]> => {
      const tasksDocs = await db.tasks
        .find({
          selector: { _deleted: { $ne: true } },
        })
        .exec()

      const tasksWithTimeEntries = await Promise.all(
        tasksDocs.map(async (task: RxDocument<SyncTaskRxDBDTO>) => {
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

            timeEntries: timeEntriesDocs.map(
              (te: RxDocument<SyncTimeEntryRxDBDTO>) => te.toJSON(),
            ),
          }
        }),
      )
      return JSON.parse(JSON.stringify(tasksWithTimeEntries))
    },
  })

  const { data: metadata } = useSuspenseQuery({
    queryKey: ['metadata'],
    queryFn: async (): Promise<SyncMetadataRxDBDTO | null> => {
      const metadataDoc = await db.metadata.findOne().exec()
      return metadataDoc
        ? JSON.parse(JSON.stringify(metadataDoc.toJSON()))
        : null
    },
  })

  const { data: kanbanColumns } = useSuspenseQuery({
    queryKey: ['kanbanColumns'],
    queryFn: async (): Promise<KanbanColumnRxDBDTO[]> => {
      const docs = await db.kanbanColumns
        .find({
          selector: { _deleted: { $ne: true }, isActive: { $eq: true } },
          sort: [{ order: 'asc' }],
        })
        .exec()
      return docs.map((d) => d.toJSON() as KanbanColumnRxDBDTO)
    },
  })

  const { data: kanbanRelations } = useSuspenseQuery({
    queryKey: ['kanbanRelations'],
    queryFn: async (): Promise<TaskKanbanColumnRxDBDTO[]> => {
      const docs = await db.kanbanTaskColumns
        .find({
          selector: { _deleted: { $ne: true }, inWorkspace: { $eq: true } },
        })
        .exec()
      return docs.map((d) => d.toJSON() as TaskKanbanColumnRxDBDTO)
    },
  })

  const { mutate: addColumnMutate } = useMutation<
    void,
    Error,
    KanbanColumnRxDBDTO,
    { previousColumns: KanbanColumnRxDBDTO[] }
  >({
    mutationFn: async (newColumn) => {
      await db.kanbanColumns.insert(newColumn)
    },
    onMutate: async (newColumn) => {
      await queryClient.cancelQueries({ queryKey: ['kanbanColumns'] })

      const previousColumns =
        queryClient.getQueryData<KanbanColumnRxDBDTO[]>(['kanbanColumns']) ?? []

      queryClient.setQueryData(
        ['kanbanColumns'],
        [...previousColumns, newColumn],
      )

      return { previousColumns }
    },
    onError: (err, newColumn, context) => {
      console.error('Falha ao adicionar nova coluna:', err)
      toast.error('Falha ao adicionar nova coluna.')

      if (context?.previousColumns) {
        queryClient.setQueryData(['kanbanColumns'], context.previousColumns)
      }
    },
    onSuccess: () => {
      toast.success('Coluna adicionada com sucesso!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanColumns'] })
    },
  })

  /**
   * Função passada ao componente Board.
   * Ela prepara o novo objeto de coluna e chama a mutação.
   */
  const handleAddColumn = useCallback(
    (name: string) => {
      const previousColumns =
        queryClient.getQueryData<KanbanColumnRxDBDTO[]>(['kanbanColumns']) ?? []

      const maxOrder =
        previousColumns.length > 0
          ? previousColumns[previousColumns.length - 1].order
          : -1
      const newOrder = maxOrder + 1
      const newId = crypto.randomUUID()
      const now = new Date().toISOString()

      const newColumn: KanbanColumnRxDBDTO = {
        _id: newId,
        _deleted: false,
        id: newId,
        name: name,
        order: newOrder,
        workspaceId: workspace.id,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }

      addColumnMutate(newColumn)
    },
    [queryClient, workspace, addColumnMutate],
  )

  const taskMap = new Map<string, TCard[]>()
  for (const col of kanbanColumns) taskMap.set(col.id, [])

  for (const rel of kanbanRelations) {
    const task = tasks.find((t) => t.id === rel.taskId)
    if (!task) continue
    const colId = rel.columnId
    if (!taskMap.has(colId)) continue
    const card: TCard = {
      task: task as SyncTaskRxDBDTO,
      metadata: metadata ?? ({} as SyncMetadataRxDBDTO),
    }
    taskMap.get(colId)?.push(card)
  }

  const columns: TColumn[] = kanbanColumns.map((col) => ({
    id: col.id,
    title: col.name,
    cards: (taskMap.get(col.id) || []).sort((a, b) => {
      const posA =
        kanbanRelations.find((r) => r.taskId === a.task.id)?.position ?? 0
      const posB =
        kanbanRelations.find((r) => r.taskId === b.task.id)?.position ?? 0
      return posA - posB
    }),
  }))

  const initialBoard: TBoard = { columns }

  return (
    <Board
      initial={initialBoard}
      enableAddColumns
      onAddColumn={handleAddColumn}
    />
  )
}

function KanbanBoardContent() {
  const db = useSyncStore((state) => state.db)
  const { workspace } = useWorkspace()
  const { user } = useAuth()

  if (!db || !user || !workspace) {
    return <KanbanSkeleton />
  }

  return <KanbanBoard db={db} user={user} workspace={workspace} />
}

export function Activities() {
  return (
    <div className="w-[calc(100vw-300px-72px-2rem)] flex-1 cursor-grab overflow-auto rounded-md border select-none active:cursor-grabbing">
      <Suspense fallback={<KanbanSkeleton />}>
        <KanbanBoardContent />
      </Suspense>
    </div>
  )
}
