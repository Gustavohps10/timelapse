import { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClockAlertIcon,
} from 'lucide-react'

import { TimeEntry } from '@/ui/components/time-entries-table/data-table'
import { Badge } from '@/ui/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/ui/components/ui/tooltip'

export type Row = TimeEntry & {
  subRows?: TimeEntry[]
}

export const columns: ColumnDef<Row>[] = [
  {
    id: 'expand',
    header: 'Apontamentos',
    size: 60,
    minSize: 50,
    cell: ({ row }) => {
      if (row.depth > 0) return null

      const count = row.subRows?.length ?? 0
      const hasSubRows = count > 0

      return (
        <button
          onClick={hasSubRows ? row.getToggleExpandedHandler() : undefined}
          className="flex items-center gap-2"
          style={{ cursor: hasSubRows ? 'pointer' : 'default' }}
          aria-label={
            hasSubRows
              ? row.getIsExpanded()
                ? 'Colapsar'
                : 'Expandir'
              : undefined
          }
        >
          {hasSubRows ? (
            row.getIsExpanded() ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          ) : (
            <div style={{ width: 16 }} />
          )}
          <Badge variant="secondary">{count || 1}</Badge>
        </button>
      )
    },
  },
  {
    accessorKey: 'issue_id',
    header: 'Ticket',
    size: 60,
    minSize: 50,
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-zoom-in font-mono tracking-tight"
            >
              #{row.original.issue_id}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="text-foreground bg-secondary border">
            <p>MODULO 1 - REGRA DE NEGOCIO - BUG NO CAMPO N</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    id: 'sincStatus',
    header: 'Status',
    cell: ({ row }) => {
      const isParent = row.depth === 0
      const subRows = row.subRows

      if (isParent && subRows?.length) {
        const statuses = subRows.map((r) => r.original.sincStatus)

        const hasPending = statuses.includes('pending')
        const hasFailed = statuses.includes('failed')
        const allSynced = statuses.every((s) => s === 'synced')

        return (
          <div className="flex items-center gap-1">
            {allSynced && (
              <CheckCircle
                className="text-green-500"
                size={16}
                strokeWidth={1.5}
              />
            )}
            {!allSynced && hasPending && (
              <ClockAlertIcon
                className="text-neutral-500"
                size={16}
                strokeWidth={1.5}
              />
            )}
            {!allSynced && hasFailed && (
              <AlertTriangle
                className="text-red-500 dark:text-red-400"
                size={16}
                strokeWidth={1.5}
              />
            )}
          </div>
        )
      }

      const status = row.original.sincStatus
      switch (status) {
        case 'synced':
          return (
            <CheckCircle
              className="text-green-500"
              size={16}
              strokeWidth={1.5}
            />
          )
        case 'pending':
          return (
            <ClockAlertIcon
              className="text-neutral-500"
              size={16}
              strokeWidth={1.5}
            />
          )
        case 'failed':
          return (
            <AlertTriangle
              className="text-red-500 dark:text-red-400"
              size={16}
              strokeWidth={1.5}
            />
          )
        default:
          return null
      }
    },
  },
  {
    accessorKey: 'spent_on',
    header: 'Data',
    cell: ({ row }) => {
      const date = row.original.spent_on
      const parsed = new Date(date)
      return (
        <span className="font-mono">
          {isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('pt-BR')}
        </span>
      )
    },
  },
  {
    accessorKey: 'hours',
    header: 'Horas',
    cell: ({ getValue }) => {
      const hours = getValue() as number

      return (
        <span className="font-mono tracking-tighter">
          {`${hours.toFixed(2)} h`}
        </span>
      )
    },
  },
  {
    accessorKey: 'activity_id',
    header: 'Atividade',
    cell: ({ row }) => {
      const activityId = row.original.activity_id
      return activityId ? `#${activityId}` : '—'
    },
  },
  {
    accessorKey: 'comments',
    header: 'Comentário',
    cell: ({ row }) => {
      return row.original.comments || '—'
    },
  },
]
