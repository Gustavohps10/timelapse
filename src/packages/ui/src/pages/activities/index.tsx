'use client'

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import { useQuery } from '@tanstack/react-query'
import { GripVertical } from 'lucide-react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '@/hooks'
import { useActivitiesStore } from '@/stores/activities-store'
import { useSyncStore } from '@/stores/syncStore'
import { SyncMetadataRxDBDTO } from '@/sync/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/sync/tasks-sync-schema'

type TaskWithTimeEntries = SyncTaskRxDBDTO & { timeEntries: any[] }

// -----------------------------
// TaskCard (isolado, pega apenas o que precisa do store)
// -----------------------------
const TaskCard = memo(function TaskCard({
  task,
  index,
  columnId,
}: {
  task: { id: string; title: string; [key: string]: any }
  index: number
  columnId: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // pega apenas a função do store (selector isolado -> evita re-renders desnecessários)
  const reorderSameColumn = useActivitiesStore((s) => s.reorderSameColumn)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({ taskId: task.id, index, columnId }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            render({ container }) {
              const preview = el.cloneNode(true) as HTMLElement
              preview.style.transform = 'rotate(3deg)'
              // evitar estilos problemáticos no preview
              preview.style.width = `${el.offsetWidth}px`
              container.appendChild(preview)
              return () => preview.remove()
            },
          })
        },
      }),
      dropTargetForElements({
        element: el,
        canDrop: ({ source }) => source.data.columnId === columnId,
        onDrop: ({ source }) => {
          if (source.data.columnId === columnId) {
            // move somente dentro da mesma coluna
            reorderSameColumn(columnId, source.data.index as number, index)
          }
        },
      }),
    )
  }, [task.id, index, columnId, reorderSameColumn])

  return (
    <div
      ref={ref}
      className={`bg-card cursor-grab rounded-md border p-3 shadow-sm transition active:cursor-grabbing ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm leading-tight font-medium">{task.title}</p>
        <GripVertical
          size={16}
          className="text-muted-foreground flex-shrink-0"
        />
      </div>
    </div>
  )
})

// -----------------------------
// KanbanColumn (cada coluna lê apenas sua lista do store)
// -----------------------------
const KanbanColumn = memo(function KanbanColumn({
  status,
}: {
  status: SyncMetadataRxDBDTO['taskStatuses'][0]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDraggedOver, setIsDraggedOver] = useState(false)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const moveBetweenColumns = useActivitiesStore((s) => s.moveBetweenColumns)
  const reorderSameColumn = useActivitiesStore((s) => s.reorderSameColumn)

  const tasks = useActivitiesStore((s: any) => {
    const cols = s.columns
    if (!cols) return []
    if (typeof cols.get === 'function') return cols.get(status.name) || []
    return cols[status.name] || []
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    return combine(
      dropTargetForElements({
        element: el,
        getData: () => ({ columnId: status.name }),
        onDragEnter: () => setIsDraggedOver(true),
        onDragLeave: () => {
          setIsDraggedOver(false)
          setHoverIndex(null)
        },
        onDrop: ({ source }) => {
          setIsDraggedOver(false)
          setHoverIndex(null)
          const sourceColumnId = source.data.columnId as string
          if (sourceColumnId === status.name) return
          moveBetweenColumns(
            sourceColumnId,
            status.name,
            source.data.index as number,
            tasks.length,
          )
        },
      }),
      autoScrollForElements({ element: el }),
    )
  }, [status.name, tasks.length, moveBetweenColumns])

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault()
    setHoverIndex(index)
  }

  return (
    <div
      ref={ref}
      className={`bg-muted/20 flex h-fit max-h-full w-80 flex-shrink-0 flex-col rounded-lg border p-2 transition-colors ${
        isDraggedOver ? 'bg-primary/10 ring-primary/50 ring-2' : ''
      }`}
    >
      <div className="flex items-center gap-2 px-2 py-1">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: status.colors?.background || '#888' }}
        />
        <h2 className="text-sm font-semibold">{status.name}</h2>
        <span className="text-muted-foreground ml-1 text-xs">
          {tasks.length}
        </span>
      </div>

      <div
        className="custom-scroll flex flex-col gap-2 overflow-y-auto p-1"
        onDragOver={(e) => handleDragOver(e, tasks.length)}
      >
        {tasks.map((task: any, index: number) => (
          <div key={task.id}>
            {/* Slot antes do card */}
            {hoverIndex === index && (
              <div className="border-primary/50 bg-primary/5 mb-2 h-20 rounded-md border-2 border-dashed transition-all" />
            )}

            <div
              onDragOver={(e) => handleDragOver(e, index + 1)}
              className="relative"
            >
              <TaskCard task={task} index={index} columnId={status.name} />
            </div>
          </div>
        ))}

        {/* Slot no final da coluna */}
        {hoverIndex === tasks.length && (
          <div className="border-primary/50 bg-primary/5 mt-2 h-20 rounded-md border-2 border-dashed transition-all" />
        )}
      </div>
    </div>
  )
})

// -----------------------------
// Activities (comportamento equivalente ao seu original)
// -----------------------------
export function Activities() {
  const db = useSyncStore((state) => state.db)
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  // pega setColumns e columns do store (uso mínimo no pai: apenas setColumns -> evitar re-renders do board)
  const setColumns = useActivitiesStore((s) => s.setColumns)

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async (): Promise<TaskWithTimeEntries[]> => {
      if (!db || !user?.id) return []

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

  const taskStatuses = useMemo(() => metadata?.taskStatuses || [], [metadata])

  useEffect(() => {
    if (tasks && taskStatuses.length > 0) {
      setColumns(tasks, taskStatuses)
    }
  }, [tasks, taskStatuses, setColumns])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    return autoScrollForElements({ element: el })
  }, [])

  if (isLoadingTasks || isLoadingMetadata) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground mt-10">Carregando atividades...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <h1 className="px-6 py-4 text-2xl font-semibold tracking-tight">
        Atividades
      </h1>

      {metadata ? (
        <div className="flex-1 overflow-hidden rounded-md border">
          <div
            ref={containerRef}
            className="custom-scroll flex h-full items-start gap-6 overflow-x-auto p-4 select-none"
            style={{ width: 'calc(100vw - 300px - 4rem)' }}
          >
            {taskStatuses.map((status) => (
              <KanbanColumn key={status.name} status={status} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-md border p-6">
          <p className="text-muted-foreground">Metadados não encontrados.</p>
        </div>
      )}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--color-muted); border: 2px solid transparent; border-radius: 9999px; background-clip: padding-box; }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: var(--color-muted) transparent; }
      `}</style>
    </div>
  )
}
