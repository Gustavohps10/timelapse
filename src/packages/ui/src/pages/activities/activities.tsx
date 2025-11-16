'use client'

import {
  type QueryClient,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { WorkspaceViewModel } from '@timelapse/presentation/view-models'
import { CalendarIcon, TrashIcon, UserIcon } from 'lucide-react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { DeepReadonly, RxDocument } from 'rxdb'
import { toast } from 'sonner'

import { User } from '@/@types/session/User'
import { Loader } from '@/components'
import { Board } from '@/components/dnd/board'
import {
  ColumnAction,
  ColumnActionGroup,
  TBoard,
  TCard,
  TColumn,
} from '@/components/dnd/data'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { KanbanColumnRxDBDTO } from '@/db/schemas/kanban-column-schema'
import { TaskKanbanColumnRxDBDTO } from '@/db/schemas/kanban-task-columns-schema'
import { SyncMetadataRxDBDTO } from '@/db/schemas/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'
import { useAuth, useWorkspace } from '@/hooks'
import { AppDatabase, useSyncStore } from '@/stores/syncStore'

type TaskWithTimeEntries = SyncTaskRxDBDTO & { timeEntries: any[] }

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function KanbanSkeleton() {
  const skeletonData = useMemo(() => {
    const numCols = getRandomInt(3, 5)
    return Array.from({ length: numCols }).map((_, i) => ({
      id: i,
      numCards: getRandomInt(1, 4),
    }))
  }, [])

  return (
    <div className="grid h-full w-full auto-cols-[300px] grid-flow-col gap-4 p-4">
      {skeletonData.map((col) => (
        <Card key={col.id} className="flex flex-col rounded-md border-0">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: col.numCards }).map((_, j) => (
              <Skeleton key={j} className="h-20 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type ColumnMutationContext = {
  previousColumns?: DeepReadonly<KanbanColumnRxDBDTO[]>
}

function useInsertColumnMutation(db: AppDatabase) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, KanbanColumnRxDBDTO, ColumnMutationContext>({
    mutationFn: async (newColumn) => {
      await db.kanbanColumns.insert(newColumn)
    },

    onMutate: async (newColumn) => {
      let previousColumns: DeepReadonly<KanbanColumnRxDBDTO[]> = []
      queryClient.setQueryData(
        ['kanbanColumns'],
        (prev: DeepReadonly<KanbanColumnRxDBDTO[]> | undefined) => {
          previousColumns = prev ?? []
          return [...previousColumns, newColumn]
        },
      )
      return { previousColumns }
    },
    onError: (err, _newColumn, ctx) => {
      console.error('Falha ao adicionar nova coluna:', err)
      toast.error('Falha ao adicionar nova coluna.')
      if (ctx?.previousColumns) {
        queryClient.setQueryData(['kanbanColumns'], ctx.previousColumns)
      }
    },
    onSuccess: () => {
      toast.success('Coluna adicionada com sucesso!')
    },
  })
}

function useDeleteColumnMutation(db: AppDatabase) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string, ColumnMutationContext>({
    mutationFn: async (columnId) => {
      const doc = await db.kanbanColumns.findOne(columnId).exec()
      if (!doc) return

      await doc.patch({
        _deleted: true,
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
    },
    onMutate: async (columnId) => {
      let previousColumns: DeepReadonly<KanbanColumnRxDBDTO[]> = []
      queryClient.setQueryData(
        ['kanbanColumns'],
        (prev: DeepReadonly<KanbanColumnRxDBDTO[]> | undefined) => {
          previousColumns = prev ?? []
          return previousColumns.filter((c) => c.id !== columnId)
        },
      )
      return { previousColumns }
    },
    onError: (_err, _columnId, ctx) => {
      toast.error('Falha ao remover coluna.')
      if (ctx?.previousColumns) {
        queryClient.setQueryData(['kanbanColumns'], ctx.previousColumns)
      }
    },
    onSuccess: () => {
      toast.success('Coluna removida!')
    },
  })
}

/**
 * Embaralha um array e seleciona os primeiros N elementos.
 * @param array Array para embaralhar
 * @param count Número de elementos para selecionar
 * @returns Um novo array com N elementos aleatórios
 */
function shuffleAndPick<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * Hook para popular o board com tarefas de teste.
 * Roda TODA VEZ que o componente é montado (após um delay).
 * Deleta todas as amarrações existentes e amarra um TOTAL de 20 tarefas
 * JÁ EXISTENTES, distribuídas entre as colunas.
 */
function useSeedFakeTasks(db: AppDatabase, queryClient: QueryClient) {
  useEffect(() => {
    const seedTasks = async () => {
      try {
        console.log('--- 🚀 EXECUTANDO SEED DE TESTE KANBAN ---')

        console.log('Limpando amarrações antigas...')
        await db.kanbanTaskColumns.find().remove()
        console.log('Amarrações antigas removidas.')

        const [columnsDocs, allTasksDocs] = await Promise.all([
          db.kanbanColumns
            .find({ selector: { _deleted: { $ne: true } } })
            .exec(),
          db.tasks.find({ selector: { _deleted: { $ne: true } } }).exec(),
        ])

        const columns = columnsDocs.map((d) => d.toJSON())
        const allTasks = allTasksDocs.map((d) => d.toJSON())

        if (columns.length === 0) {
          toast.warning('Seed: Nenhuma coluna encontrada para amarrar tarefas.')
          return
        }
        if (allTasks.length === 0) {
          toast.warning('Seed: Nenhuma tarefa encontrada para amarrar.')
          return
        }

        console.log(
          `Seed: Encontradas ${columns.length} colunas e ${allTasks.length} tarefas.`,
        )

        const tasksToDistribute = shuffleAndPick(allTasks, 20)
        console.log(
          `Seed: Distribuindo um total de ${tasksToDistribute.length} tarefas.`,
        )

        const newRelations: TaskKanbanColumnRxDBDTO[] = []
        const now = new Date().toISOString()

        const columnPositionMap = new Map<string, number>()
        columns.forEach((col) => columnPositionMap.set(col.id, 0))

        tasksToDistribute.forEach((task, index) => {
          const columnIndex = index % columns.length
          const column = columns[columnIndex]

          const position = columnPositionMap.get(column.id) ?? 0
          columnPositionMap.set(column.id, position + 1)

          const relationId = crypto.randomUUID()
          newRelations.push({
            _id: relationId,
            _deleted: false,
            taskId: task.id,
            columnId: column.id,
            inWorkspace: true,
            position,
            createdAt: now,
            updatedAt: now,
          })
        })

        if (newRelations.length > 0) {
          console.log(
            `Seed: Inserindo ${newRelations.length} novas amarrações...`,
          )
          await db.kanbanTaskColumns.bulkInsert(newRelations)
          console.log('Seed: Novas amarrações inseridas.')
        }

        await queryClient.invalidateQueries({ queryKey: ['kanbanRelations'] })
        toast.success(
          `Seed: ${newRelations.length} tarefas de teste amarradas!`,
        )
      } catch (error) {
        console.error('Falha no script de seed do Kanban:', error)
        toast.error('Falha ao amarrar tarefas de teste.')
      }
    }

    const timer = setTimeout(() => {
      void seedTasks()
    }, 500)

    return () => clearTimeout(timer)
  }, [db, queryClient])
}

function useOptimizedBoard({
  kanbanColumns,
  kanbanRelations,
  tasks,
  metadata,
}: {
  kanbanColumns: DeepReadonly<KanbanColumnRxDBDTO[]>
  kanbanRelations: DeepReadonly<TaskKanbanColumnRxDBDTO[]>
  tasks: TaskWithTimeEntries[]
  metadata: DeepReadonly<SyncMetadataRxDBDTO> | null
}): TBoard {
  return useMemo(() => {
    const tasksMap = new Map<string, TaskWithTimeEntries>()
    tasks.forEach((t) => tasksMap.set(t.id, t))

    const relationsMap = new Map<
      string,
      DeepReadonly<TaskKanbanColumnRxDBDTO>
    >()
    kanbanRelations.forEach((r) => relationsMap.set(r.taskId, r))

    const columnTasksMap = new Map<string, TCard[]>()
    kanbanColumns.forEach((col) => columnTasksMap.set(col.id, []))

    kanbanRelations.forEach((rel) => {
      const task = tasksMap.get(rel.taskId)
      if (!task) return
      const list = columnTasksMap.get(rel.columnId)
      if (!list) return

      list.push({
        task: task as SyncTaskRxDBDTO,
        metadata: (metadata ?? {}) as SyncMetadataRxDBDTO,
      })
    })

    const columns: TColumn[] = kanbanColumns.map((col) => {
      const cards = columnTasksMap.get(col.id) ?? []
      cards.sort((a, b) => {
        const pa = relationsMap.get(a.task.id)?.position ?? 0
        const pb = relationsMap.get(b.task.id)?.position ?? 0
        return pa - pb
      })

      return {
        id: col.id,
        title: col.name,
        position: col.order,
        cards,
        isLoading: false,
      }
    })

    return { columns }
  }, [kanbanColumns, kanbanRelations, tasks, metadata])
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
  const { mutate: addColumn } = useInsertColumnMutation(db)
  const deleteColumnMutation = useDeleteColumnMutation(db)

  useSeedFakeTasks(db, queryClient)

  const { data: kanbanColumns } = useSuspenseQuery({
    queryKey: ['kanbanColumns'],
    queryFn: async () => {
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
    queryFn: async () => {
      const docs = await db.kanbanTaskColumns
        .find({
          selector: { _deleted: { $ne: true }, inWorkspace: { $eq: true } },
        })
        .exec()
      return docs.map((d) => d.toJSON() as TaskKanbanColumnRxDBDTO)
    },
  })

  const { data: tasks } = useSuspenseQuery({
    queryKey: ['tasks', user.id],
    queryFn: async (): Promise<TaskWithTimeEntries[]> => {
      const taskDocs = await db.tasks
        .find({ selector: { _deleted: { $ne: true } } })
        .exec()

      const tasksWithTimeEntries = await Promise.all(
        taskDocs.map(async (t: RxDocument<SyncTaskRxDBDTO>) => {
          const obj = t.toJSON()
          const timeDocs = await db.timeEntries
            .find({
              selector: {
                _deleted: { $ne: true },
                'task.id': { $eq: obj.id },
              },
            })
            .exec()

          return {
            ...obj,
            timeEntries: timeDocs.map((d) => d.toJSON()),
          }
        }),
      )

      return JSON.parse(JSON.stringify(tasksWithTimeEntries))
    },
  })

  const { data: metadata } = useSuspenseQuery({
    queryKey: ['metadata'],
    queryFn: async () => {
      const doc = await db.metadata.findOne().exec()
      return doc ? (doc.toJSON() as SyncMetadataRxDBDTO) : null
    },
  })

  const [columnForDeletion, setColumnForDeletion] = useState<TColumn | null>(
    null,
  )
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadingColumnId, setLoadingColumnId] = useState<string | null>(null)

  const handleAddColumn = useCallback(
    (name: string) => {
      const currentColumns =
        queryClient.getQueryData<DeepReadonly<KanbanColumnRxDBDTO[]>>([
          'kanbanColumns',
        ]) ?? []

      const maxOrder =
        currentColumns.length > 0
          ? currentColumns[currentColumns.length - 1].order
          : -1

      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      addColumn({
        _id: id,
        _deleted: false,
        id,
        name,
        order: maxOrder + 1,
        workspaceId: workspace.id,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
    },
    [addColumn, workspace.id, queryClient],
  )

  const confirmDeleteColumn = useCallback(async () => {
    if (!columnForDeletion) return
    try {
      setIsDeleting(true)
      setLoadingColumnId(columnForDeletion.id)
      await deleteColumnMutation.mutateAsync(columnForDeletion.id)
      setIsDeleteAlertOpen(false)
    } catch (err) {
      console.error('Erro ao deletar coluna', err)
      toast.error('Erro ao deletar coluna.')
    } finally {
      setIsDeleting(false)
      setLoadingColumnId(null)
    }
  }, [columnForDeletion, deleteColumnMutation, setLoadingColumnId])

  const handleAlertOpenChange = (isOpen: boolean) => {
    if (isDeleting) return
    setIsDeleteAlertOpen(isOpen)
  }

  const board = useOptimizedBoard({
    kanbanColumns,
    kanbanRelations,
    tasks,
    metadata,
  })

  const boardWithActions: TBoard = useMemo(() => {
    const deleteAction: ColumnAction = {
      label: 'Excluir Coluna',
      icon: <TrashIcon className="h-3.5 w-3.5" />,
      onClick: (col: TColumn) => {
        setColumnForDeletion(col)
        setIsDeleteAlertOpen(true)
      },
    }

    const actionGroup: ColumnActionGroup = {
      title: 'Ações',
      items: [deleteAction],
    }

    return {
      columns: board.columns.map((col) => ({
        ...col,
        isLoading: col.id === loadingColumnId,
        actions: [actionGroup],
        onChange: async (changedColumn: TColumn) => {
          console.log('disparando evento de onChange da coluna', changedColumn)
          const { id, title, position } = changedColumn

          type UpdateColumnData = Partial<
            Omit<KanbanColumnRxDBDTO, 'id' | '_id'>
          >

          const dtoChanges: UpdateColumnData = {}

          if (title !== col.title) {
            dtoChanges.name = title
          }
          if (position !== col.position) {
            dtoChanges.order = position
          }

          if (Object.keys(dtoChanges).length === 0) return

          try {
            setLoadingColumnId(id)
            const doc = await db.kanbanColumns.findOne(id).exec()
            if (doc) {
              await doc.patch({
                ...dtoChanges,
                updatedAt: new Date().toISOString(),
              })
            }

            await queryClient.invalidateQueries({
              queryKey: ['kanbanColumns'],
            })
            toast.success('Coluna atualizada!')
          } catch (err) {
            console.error('Falha ao atualizar coluna', err)
            toast.error('Falha ao atualizar coluna.')
          } finally {
            setLoadingColumnId(null)
          }
        },
      })),
    }
  }, [board, db, queryClient, loadingColumnId])

  return (
    <>
      <Board
        board={boardWithActions}
        enableAddColumns
        onAddColumn={handleAddColumn}
      />

      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={handleAlertOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir coluna "{columnForDeletion?.title}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita. Todos os cartões dentro desta
              coluna continuarão existindo, porém sem coluna atribuída.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  if (isDeleting) return
                  void confirmDeleteColumn()
                }}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader /> : 'Excluir'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function KanbanBoardContent() {
  const db = useSyncStore((s) => s.db)
  const { workspace } = useWorkspace()
  const { user } = useAuth()

  if (!db || !user || !workspace) return null

  return <KanbanBoard db={db} user={user} workspace={workspace} />
}

function KanbanToolbar() {
  return (
    <div className="mb-4 flex shrink-0 items-center gap-3">
      <Input
        type="search"
        placeholder="Buscar tarefas..."
        className="h-9 w-64"
      />

      <Button variant="outline" size="sm" className="h-9">
        <UserIcon className="mr-2 h-4 w-4" />
        Pessoa
      </Button>

      <Button variant="outline" size="sm" className="h-9">
        <CalendarIcon className="mr-2 h-4 w-4" />
        Data
      </Button>

      <Button variant="outline" size="sm" className="h-9">
        Filtro
      </Button>

      <div className="ml-4 flex items-center -space-x-2">
        <Avatar className="border-background h-8 w-8 border-2">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar className="border-background h-8 w-8 border-2">
          <AvatarFallback>U2</AvatarFallback>
        </Avatar>
        <Avatar className="border-background h-8 w-8 border-2">
          <AvatarFallback>U3</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

export function Activities() {
  return (
    <>
      <KanbanToolbar />
      <Suspense fallback={<KanbanSkeleton />}>
        <div className="w-[calc(100vw-300px-72px-rem)] cursor-grab overflow-auto rounded-md border select-none active:cursor-grabbing">
          <KanbanBoardContent />
        </div>
      </Suspense>
    </>
  )
}
