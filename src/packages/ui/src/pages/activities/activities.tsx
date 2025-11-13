'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useEffect } from 'react' // 1. Imports atualizados

import { Board } from '@/components/dnd/board'
import { TBoard, TCard, TColumn } from '@/components/dnd/data'
import { Card, CardContent, CardHeader } from '@/components/ui/card' // 2. Shadcn
import { Skeleton } from '@/components/ui/skeleton' // 2. Shadcn
import { KanbanColumnRxDBDTO } from '@/db/schemas/kanban-column-schema'
import { TaskKanbanColumnRxDBDTO } from '@/db/schemas/kanban-task-columns-schema'
import { SyncMetadataRxDBDTO } from '@/db/schemas/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'
import { useAuth } from '@/hooks'
import { useSyncStore } from '@/stores/syncStore'

type TaskWithTimeEntries = SyncTaskRxDBDTO & { timeEntries: any[] }

const simpleUUID = () => `id_${Math.random().toString(36).substring(2, 11)}`

// --- HOOK DE SEED (EXTRAÍDO) ---
function useDevSeed() {
  const db = useSyncStore((state) => state.db)

  useEffect(() => {
    // Roda apenas em ambiente de desenvolvimento e apenas uma vez por sessão
    if (process.env.NODE_ENV !== 'development' || (window as any).dbSeeded) {
      return
    }

    const seedDatabase = async () => {
      if (!db) return

      try {
        // 1. Verifica se dados já existem para não duplicar
        const existingColumns = await db.kanbanColumns.count().exec()
        if (existingColumns > 0) {
          console.log('DEV: Dados do Kanban já existem. Pulando o seed.')
          ;(window as any).dbSeeded = true // Marca como "seedado" nesta sessão
          return
        }

        console.log('DEV: Populando banco com dados de teste para o Kanban...')

        // 2. Pega 10 tarefas aleatórias
        const tasks = await db.tasks
          .find({ selector: { _deleted: { $ne: true } } })
          .limit(10)
          .exec()

        if (tasks.length === 0) {
          console.warn(
            'DEV: Nenhuma tarefa encontrada. Não é possível criar relações.',
          )
          return
        }
        const taskIds = tasks.map((t) => t.id)

        // 3. Cria 7 colunas
        const columnNames = [
          'Backlog',
          'A Fazer',
          'Em Progresso',
          'Em Revisão',
          'Testando',
          'Bloqueado',
          'Concluído',
        ]
        const now = new Date().toISOString()
        const workspaceId = 'dev-workspace-1' // Workspace de teste

        const newColumns: KanbanColumnRxDBDTO[] = columnNames.map(
          (name, index) => {
            const id = simpleUUID()
            return {
              _id: id,
              _deleted: false,
              id: id,
              name: name,
              order: index,
              workspaceId: workspaceId,
              isActive: true,
              createdAt: now,
              updatedAt: now,
            }
          },
        )

        await db.kanbanColumns.bulkInsert(newColumns)
        const columnIds = newColumns.map((c) => c.id)
        console.log(`DEV: ${columnIds.length} colunas criadas.`)

        // 4. Cria as amarrações (relações)
        const newRelations: TaskKanbanColumnRxDBDTO[] = []
        const columnPositions = new Map<string, number>(
          columnIds.map((id) => [id, 0]),
        )

        for (const taskId of taskIds) {
          const randomColumnId =
            columnIds[Math.floor(Math.random() * columnIds.length)]
          const position = columnPositions.get(randomColumnId)!
          columnPositions.set(randomColumnId, position + 1)

          const relationId = simpleUUID()
          newRelations.push({
            _id: relationId,
            _deleted: false,
            taskId: taskId,
            columnId: randomColumnId,
            inWorkspace: true,
            position: position,
            createdAt: now,
            updatedAt: now,
          })
        }

        await db.kanbanTaskColumns.bulkInsert(newRelations)
        console.log(
          `DEV: ${newRelations.length} relações entre tarefas e colunas criadas.`,
        )
        ;(window as any).dbSeeded = true
      } catch (error) {
        console.error('DEV: Erro ao popular dados de teste do Kanban:', error)
      }
    }

    setTimeout(seedDatabase, 1000)
  }, [db])
}

// --- SKELETON (SHADCN UI) ---
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

// --- COMPONENTE DE DADOS (SUSPENSE) ---
function KanbanBoardContent() {
  const db = useSyncStore((state) => state.db)!
  const { user } = useAuth()!

  // Hook de seed é chamado aqui
  useDevSeed()

  // 1. Fetch de Tasks (com useSuspenseQuery)
  const { data: tasks } = useSuspenseQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async (): Promise<TaskWithTimeEntries[]> => {
      const tasksDocs = await db.tasks
        .find({
          selector: { _deleted: { $ne: true } },
        })
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
  })

  // 2. Fetch de Metadata (com useSuspenseQuery)
  const { data: metadata } = useSuspenseQuery({
    queryKey: ['metadata'],
    queryFn: async (): Promise<SyncMetadataRxDBDTO | null> => {
      const metadataDoc = await db.metadata.findOne().exec()
      return metadataDoc
        ? JSON.parse(JSON.stringify(metadataDoc.toJSON()))
        : null
    },
  })

  // 3. Fetch de Colunas (com useSuspenseQuery)
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

  // 4. Fetch de Relações (com useSuspenseQuery)
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

  // --- Transformação de Dados ---
  // Sem useMemo! Este código só roda quando TUDO acima estiver pronto.
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
    taskMap.get(colId)!.push(card)
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

  // Renderiza o Board diretamente
  return <Board initial={initialBoard} />
}

// --- COMPONENTE PRINCIPAL (EXPORTADO) ---
export function Activities() {
  const db = useSyncStore((state) => state.db)
  const { user } = useAuth()

  return (
    <div className="w-[calc(100vw-300px-72px-2rem)] flex-1 cursor-grab overflow-auto rounded-md border select-none active:cursor-grabbing">
      <Suspense fallback={<KanbanSkeleton />}>
        {/* Só renderiza o Board se o DB e o User estiverem prontos */}
        {db && user ? <KanbanBoardContent /> : <KanbanSkeleton />}
      </Suspense>
    </div>
  )
}
