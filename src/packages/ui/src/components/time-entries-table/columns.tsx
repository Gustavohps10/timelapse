'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CloudOff,
  RefreshCcw,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { SyncTimeEntryRxDBDTO } from '@/db/schemas/time-entries-sync-schema'

export type Row = SyncTimeEntryRxDBDTO & {
  subRows?: SyncTimeEntryRxDBDTO[]
}

export const columns: ColumnDef<Row>[] = [
  {
    id: 'expand',
    header: 'Apontamentos',
    size: 100,
    cell: ({ row }) => {
      if (row.depth > 0) return null
      const count = row.original.subRows?.length ?? 0
      const hasSubRows = count > 1

      return (
        <div className="flex items-center gap-2">
          <button
            onClick={hasSubRows ? row.getToggleExpandedHandler() : undefined}
            className="flex items-center justify-center transition-opacity"
            style={{
              cursor: hasSubRows ? 'pointer' : 'default',
              opacity: hasSubRows ? 1 : 0.3,
            }}
          >
            {hasSubRows ? (
              row.getIsExpanded() ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )
            ) : (
              <div style={{ width: 14 }} />
            )}
          </button>
          <Badge
            variant="outline"
            className="bg-muted/30 border-border/50 h-5 min-w-[20px] px-1 font-mono text-[10px]"
          >
            {count || 1}
          </Badge>
        </div>
      )
    },
  },
  {
    id: 'issue_id',
    accessorKey: 'task.id',
    header: 'Ticket',
    size: 100,
    cell: ({ row }) => {
      const taskId = row.original.task?.id
      const taskSubject = row.original.taskData?.title
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="cursor-help font-mono text-[11px] font-bold"
            >
              #{taskId}
            </Badge>
          </TooltipTrigger>
          {taskSubject && (
            <TooltipContent side="right" className="max-w-[300px]">
              <p className="text-xs font-medium">{taskSubject}</p>
            </TooltipContent>
          )}
        </Tooltip>
      )
    },
  },
  {
    id: 'syncStatus',
    header: 'Sinc',
    size: 50,
    cell: ({ row }) => {
      const { syncedAt, conflicted, validationError } = row.original
      if (conflicted)
        return (
          <Tooltip>
            <TooltipTrigger>
              <RefreshCcw
                className="animate-spin-slow text-orange-500"
                size={14}
              />
            </TooltipTrigger>
            <TooltipContent>Conflito detectado</TooltipContent>
          </Tooltip>
        )
      if (validationError)
        return (
          <Tooltip>
            <TooltipTrigger>
              <AlertCircle className="text-destructive" size={14} />
            </TooltipTrigger>
            <TooltipContent>Erro de validação</TooltipContent>
          </Tooltip>
        )
      return syncedAt ? (
        <Tooltip>
          <TooltipTrigger>
            <CheckCircle2 className="text-green-500" size={14} />
          </TooltipTrigger>
          <TooltipContent>
            Sincronizado em {format(parseISO(syncedAt), 'HH:mm')}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger>
            <CloudOff className="text-muted-foreground/50" size={14} />
          </TooltipTrigger>
          <TooltipContent>Aguardando sincronização</TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Criado em',
    size: 110,
    cell: ({ row }) => {
      const date = row.original.createdAt
      return (
        <span className="text-muted-foreground font-mono text-[14px]">
          {format(parseISO(date), 'dd/MM HH:mm')}
        </span>
      )
    },
  },
  {
    id: 'activity',
    accessorKey: 'activity.id',
    header: 'Atividade',
    size: 200,
  },
  {
    id: 'comments',
    accessorKey: 'comments',
    header: 'Comentário',
    size: 150,
  },
  {
    id: 'hours',
    accessorKey: 'timeSpent',
    header: 'Tempo',
    size: 260,
  },
]
