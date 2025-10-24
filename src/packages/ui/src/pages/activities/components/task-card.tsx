'use client'

import { ExternalLink, GripVertical } from 'lucide-react'
import React, { ElementType, memo } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { SyncMetadataItem } from '@/sync/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/sync/tasks-sync-schema'

const iconMap: { [key: string]: ElementType } = {
  GripVertical,
  ExternalLink,
}

function formatTime(seconds: number): string {
  if (!seconds || seconds === 0) return '00:00:00'
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${h}:${m}:${s}`
}

export const TaskCard = memo(function TaskCard({
  task,
  priorityMap,
  onTaskClick,
  style,
}: {
  task: SyncTaskRxDBDTO
  priorityMap: Map<string, SyncMetadataItem>
  onTaskClick?: (task: SyncTaskRxDBDTO) => void
  style?: React.CSSProperties
}) {
  const priorityInfo = priorityMap.get(task.priority?.id || '')
  const PriorityIcon = priorityInfo
    ? iconMap[priorityInfo.icon] || GripVertical
    : GripVertical

  return (
    <Card
      style={style}
      className="group relative w-full cursor-pointer"
      onClick={() => onTaskClick?.(task)}
    >
      <CardHeader className="flex justify-between space-y-0 p-4">
        <div className="w-full space-y-1 overflow-hidden">
          {task.url && (
            <a
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 font-mono text-xs text-zinc-600 hover:underline dark:text-zinc-400"
            >
              #{task.id} <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <p className="line-clamp-2 text-sm font-semibold" title={task.title}>
            {task.title}
          </p>
        </div>
        <div className="text-muted-foreground rounded p-1 opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-2">
          {priorityInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <PriorityIcon
                    className={`h-4 w-4 ${priorityInfo.colors.text}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Prioridade: {task.priority?.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {task.assignedTo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {task.assignedTo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Atribuído a: {task.assignedTo.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="font-mono text-sm font-medium">
          {formatTime((task.spentHours ?? 0) * 3600)}
        </div>
      </CardContent>
    </Card>
  )
})
