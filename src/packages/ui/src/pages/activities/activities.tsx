'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { Board } from '@/components/dnd/board'
import { TBoard, TCard, TColumn } from '@/components/dnd/data'
import { SyncMetadataRxDBDTO } from '@/db/schemas/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'
import { useAuth } from '@/hooks'
// 1. Importe o Board (componente de UI) e os Tipos (da sua definição)
import { useSyncStore } from '@/stores/syncStore'

// Tipo para seu useQuery (tarefa com time entries)
type TaskWithTimeEntries = SyncTaskRxDBDTO & { timeEntries: any[] }

/**
 * Esta é a sua página principal.
 * Ela busca os dados e os passa para o componente <Board>.
 */
export function Activities() {
  const db = useSyncStore((state) => state.db)
  const { user } = useAuth()

  // 2. Busca de Tasks (Sua consulta RxDB)
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async (): Promise<TaskWithTimeEntries[]> => {
      if (!db || !user?.id) return []

      const tasksDocs = await db.tasks
        .find({
          selector: { _deleted: { $ne: true } }, // Seu filtro
        })
        .exec()

      // Sua lógica para popular timeEntries
      const tasksWithTimeEntries = await Promise.all(
        tasksDocs.map(async (task) => {
          const taskObj = task.toJSON()
          const timeEntriesDocs = await db.timeEntries
            .find({
              selector: {
                _deleted: { $ne: true }, // Boa prática adicionar isso
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

  // 3. Busca de Metadados (Sua consulta RxDB)
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

  // 4. Transformação dos Dados
  // Converte [tasks, metadata] para a estrutura TBoard
  const initialBoard: TBoard | null = useMemo(() => {
    if (!tasks || !metadata) {
      return null
    }

    const taskMap = new Map<string, TCard[]>()
    // Inicializa o mapa com colunas vazias
    for (const status of metadata.taskStatuses) {
      taskMap.set(status.name, [])
    }

    // Distribui as tasks nas colunas
    for (const task of tasks) {
      const statusName = task.status.name
      if (taskMap.has(statusName)) {
        // Cria o TCard que o seu card.tsx espera
        const card: TCard = {
          task: task as SyncTaskRxDBDTO,
          metadata: metadata,
        }
        taskMap.get(statusName)!.push(card)
      }
    }

    // Cria as colunas
    const columns: TColumn[] = metadata.taskStatuses.map((status) => ({
      id: status.name, // O ID da coluna é o nome do status
      title: status.name,
      cards: taskMap.get(status.name) || [],
      // Você pode adicionar mais propriedades aqui (ex: cores)
      // data: status,
    }))

    return { columns }
  }, [tasks, metadata])

  // --- Renderização ---
  if (isLoadingTasks || isLoadingMetadata || !initialBoard) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground mt-10">Carregando atividades...</p>
      </div>
    )
  }

  // 5. Renderiza o Board (como no exemplo oficial)
  return (
    <div className="flex-1 overflow-hidden rounded-md border">
      <Board initial={initialBoard} />
    </div>
  )
}
