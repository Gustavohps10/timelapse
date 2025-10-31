// @/pages/activities/components/inner-task-list.tsx (VIRTUALIZADO COM TANSTACK)
'use client'

import { Draggable } from '@hello-pangea/dnd'
// Importação chave do Tanstack
import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, useRef } from 'react'

import { TaskCard } from '@/pages/activities/components/task-card'
import type { SyncMetadataRxDBDTO } from '@/sync/metadata-sync-schema'
import type { SyncTaskRxDBDTO } from '@/sync/tasks-sync-schema'

const TASK_CARD_HEIGHT = 100

export const InnerTaskList = memo(function InnerTaskList({
  tasks,
  metadata,
}: {
  tasks: SyncTaskRxDBDTO[]
  metadata: SyncMetadataRxDBDTO | null
}) {
  if (!metadata) return null

  const parentRef = useRef<HTMLDivElement>(null)

  // 2. Use o hook useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => TASK_CARD_HEIGHT,
    overscan: 5,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  return (
    <div
      ref={parentRef}
      className="hide-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3 pt-0"
    >
      <div
        style={{
          height: totalSize,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const task = tasks[virtualRow.index]

          if (!task) return null

          return (
            <Draggable
              key={task.id}
              draggableId={task.id}
              index={virtualRow.index}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={{
                    ...provided.draggableProps.style,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: TASK_CARD_HEIGHT,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div
                    className="p-0"
                    style={{ height: '100%', marginBottom: '4px' }}
                  >
                    <TaskCard
                      task={task}
                      metadata={metadata}
                      dragHandleProps={provided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                </div>
              )}
            </Draggable>
          )
        })}
      </div>
    </div>
  )
})
InnerTaskList.displayName = 'InnerTaskList'
