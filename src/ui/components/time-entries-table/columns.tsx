import { ColumnDef } from '@tanstack/react-table'

import { TimeEntry } from '@/ui/components/time-entries-table/data-table'

export const columns: ColumnDef<TimeEntry>[] = [
  {
    accessorKey: 'spent_on',
    header: 'Data',
    cell: ({ getValue }) => {
      const date = getValue() as string
      return new Date(date).toLocaleDateString('pt-BR')
    },
  },
  {
    accessorKey: 'hours',
    header: 'Horas',
    cell: ({ getValue }) => {
      const hours = getValue() as number
      return `${hours.toFixed(2)} h`
    },
  },
  {
    accessorKey: 'activity_id',
    header: 'Atividade',
    cell: ({ getValue }) => {
      const activityId = getValue() as number | undefined
      return activityId ? `#${activityId}` : '—'
    },
  },
  {
    accessorKey: 'comments',
    header: 'Comentário',
    cell: ({ getValue }) => {
      const comment = getValue() as string | undefined
      return comment || '—'
    },
  },
  {
    accessorKey: 'issue_id',
    header: 'Issue',
    cell: ({ getValue }) => {
      const issueId = getValue() as number | undefined
      return `#${issueId}`
    },
  },
  {
    accessorKey: 'project_id',
    header: 'Projeto',
    cell: ({ getValue }) => {
      const projectId = getValue() as number | undefined
      return projectId ? `#${projectId}` : '—'
    },
  },
]
