'use client'

import { Draggable, Droppable } from '@hello-pangea/dnd'
import * as LucideIcons from 'lucide-react'
import { LucideProps } from 'lucide-react'
import { memo } from 'react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

import { TaskCard } from '@/pages/activities/components/task-card'
import {
  SyncMetadataItem,
  SyncMetadataRxDBDTO,
} from '@/sync/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/sync/tasks-sync-schema'

const DynamicIcon = ({
  name,
  className,
}: {
  name: string
  className?: string
}) => {
  const IconComponent = (
    LucideIcons as unknown as Record<
      string,
      ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>
    >
  )[name]

  if (!IconComponent) {
    return <LucideIcons.HelpCircle className={className} />
  }

  return <IconComponent className={className} />
}

export const Column = memo(function Column({
  status,
  tasks,
  metadata,
}: {
  status: SyncMetadataItem
  tasks: SyncTaskRxDBDTO[]
  metadata: SyncMetadataRxDBDTO | null
}) {
  return (
    <Droppable droppableId={status.name}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex max-h-[calc(100vh-12rem)] w-72 min-w-[18rem] flex-col rounded-lg bg-zinc-100/30 shadow-sm transition-all duration-200 dark:bg-zinc-800/30 ${
            snapshot.isDraggingOver
              ? 'border-primary bg-primary/5 dark:bg-primary/10 border-2 border-dashed'
              : 'border-2 border-transparent'
          }`}
        >
          <div className="text-foreground flex items-center justify-between p-3 font-semibold">
            <div className="flex items-center gap-2">
              <DynamicIcon name={status.icon} className="h-4 w-4" />
              <span>{status.name}</span>
            </div>
            <div className="bg-secondary text-secondary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
              {tasks.length}
            </div>
          </div>
          <div className="hide-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3 pt-0">
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={provided.draggableProps.style}
                    className="mb-2"
                  >
                    {metadata && (
                      <TaskCard
                        task={task}
                        metadata={metadata}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-muted-foreground/70 flex h-full min-h-[50px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-400/50 bg-zinc-500/5 p-4 text-center text-sm italic">
                Arraste atividades para esta coluna
              </div>
            )}
          </div>
        </div>
      )}
    </Droppable>
  )
})
Column.displayName = 'Column'
