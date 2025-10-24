import { SortableContext } from '@dnd-kit/sortable'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import React, { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { ScrollBar } from '@/components/ui/scroll-area'
import { TaskCard } from '@/pages/activities/components/task-card'
import { SyncMetadataItem } from '@/sync/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/sync/tasks-sync-schema'

export const BoardColumn = React.memo(function BoardColumn({
  status,
  tasks,
  priorityMap,
  onTaskClick,
}: {
  status: SyncMetadataItem
  tasks: SyncTaskRxDBDTO[]
  priorityMap: Map<string, SyncMetadataItem>
  onTaskClick: (task: SyncTaskRxDBDTO) => void
}) {
  const taskIds = useMemo(() => tasks.map((task) => task._id), [tasks])

  return (
    // Largura fixa de 320px para colunas Kanban
    <div className="bg-muted/50 flex inline-block h-full min-h-0 w-[320px] shrink-0 flex-col rounded-md">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-semibold">{status.name}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>

      {/* Scroll vertical para as tarefas dentro da coluna */}
      <ScrollArea className="min-h-0 flex-1">
        <SortableContext id={status.id} items={taskIds}>
          <div className="flex flex-col gap-2 p-2">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  priorityMap={priorityMap}
                  onTaskClick={onTaskClick}
                />
              ))
            ) : (
              // Este div é importante como drop target quando a coluna está vazia
              <div
                id={status.id} // É crucial manter o ID da coluna para drop vazio
                className="flex h-32 items-center justify-center rounded-md border-2 border-dashed"
              >
                <p className="text-muted-foreground text-sm">
                  Solte tarefas aqui
                </p>
              </div>
            )}
          </div>
        </SortableContext>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
})
