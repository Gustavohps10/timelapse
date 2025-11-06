'use client'

import type { ColumnDef, Row } from '@tanstack/react-table'
import {
  ArrowUpDown,
  BookmarkX,
  BoxIcon,
  CalendarIcon,
  CircleDashed,
  Clock,
  Ellipsis,
  Text,
  User, // Ícone adicionado
} from 'lucide-react'
import * as React from 'react'

import type { DataTableRowAction } from '@/@types/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'
import { formatDate } from '@/lib/format'

// import { updateTask } from '../lib/actions'
// import { getPriorityIcon, getStatusIcon } from '../lib/utils'

// Helper types para as props. O componente pai deve fornecer estas listas.
interface StatusOption {
  id: string
  name: string
}

interface PriorityOption {
  id: string
  name: string
}

interface GetTasksTableColumnsProps {
  allStati: StatusOption[]
  allPriorities: PriorityOption[]
  statusCounts: Record<string, number> // Chave é status.name
  priorityCounts: Record<string, number> // Chave é priority.name
  estimatedHoursRange: { min: number; max: number }
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<SyncTaskRxDBDTO> | null>
  >
}

export function getTasksTableColumns({
  allStati,
  allPriorities,
  statusCounts,
  priorityCounts,
  estimatedHoursRange,
  setRowAction,
}: GetTasksTableColumnsProps): ColumnDef<SyncTaskRxDBDTO>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          className="translate-y-0.5"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          className="translate-y-0.5"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: 'id',
      accessorKey: 'id', // Usando o 'id' do DTO
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Task" />
      ),
      cell: ({ row }) => <div className="w-20">{row.getValue('id')}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Title" />
      ),
      cell: ({ row }) => {
        const projectName = row.original.projectName // Usando projectName

        return (
          <div className="flex items-center gap-2">
            {projectName && <Badge variant="outline">{projectName}</Badge>}
            <span className="max-w-125 truncate font-medium">
              {row.getValue('title')}
            </span>
          </div>
        )
      },
      meta: {
        label: 'Title',
        placeholder: 'Search titles...',
        variant: 'text',
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: 'status',
      accessorFn: (row) => row.status.name, // Acessa o nome para filtro/sort
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        if (!status) return null

        const Icon = BoxIcon // Passa o nome para o helper

        return (
          <Badge variant="outline" className="py-1 [&>svg]:size-3.5">
            <Icon />
            <span className="capitalize">{status.name}</span>
          </Badge>
        )
      },
      meta: {
        label: 'Status',
        variant: 'multiSelect',
        options: allStati.map((status) => ({
          label: status.name.charAt(0).toUpperCase() + status.name.slice(1),
          value: status.name,
          count: statusCounts[status.name] || 0,
          icon: BoxIcon,
        })),
        icon: CircleDashed,
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: 'priority',
      accessorFn: (row) => row.priority?.name, // Acessa o nome (opcional)
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.original.priority
        if (!priority) return null

        const Icon = BookmarkX // Passa o nome para o helper

        return (
          <Badge variant="outline" className="py-1 [&>svg]:size-3.5">
            <Icon />
            <span className="capitalize">{priority.name}</span>
          </Badge>
        )
      },
      meta: {
        label: 'Priority',
        variant: 'multiSelect',
        options: allPriorities.map((priority) => ({
          label: priority.name.charAt(0).toUpperCase() + priority.name.slice(1),
          value: priority.name,
          count: priorityCounts[priority.name] || 0,
          icon: BookmarkX,
        })),
        icon: ArrowUpDown,
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: 'assignedTo',
      accessorFn: (row) => row.assignedTo?.name, // Acessa o nome (opcional)
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Assigned To" />
      ),
      cell: ({ cell }) => {
        const assignedTo = cell.getValue<string>()
        return (
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground size-3.5" />
            <span className="truncate">{assignedTo || 'N/A'}</span>
          </div>
        )
      },
      enableSorting: true,
      enableColumnFilter: false, // Pode ser habilitado se passar 'allUsers'
    },
    {
      id: 'estimatedHours',
      accessorFn: (
        row, // Soma o array
      ) => row.estimatedTimes?.reduce((acc, curr) => acc + curr.hours, 0) || 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Est. Hours" />
      ),
      cell: ({ cell }) => {
        const estimatedHours = cell.getValue<number>()
        return (
          <div className="w-20 text-right">{estimatedHours.toFixed(2)}</div>
        )
      },
      meta: {
        label: 'Est. Hours',
        variant: 'range',
        range: [estimatedHoursRange.min, estimatedHoursRange.max],
        unit: 'hr',
        icon: Clock,
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: 'spentHours',
      accessorKey: 'spentHours', // Chave direta do DTO
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Spent Hours" />
      ),
      cell: ({ cell }) => {
        const spentHours = cell.getValue<number>() || 0
        return <div className="w-20 text-right">{spentHours.toFixed(2)}</div>
      },
      enableSorting: true,
      enableColumnFilter: false, // Habilitar se passar um range nas props
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Created At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<string>()), // Schema é string
      meta: {
        label: 'Created At',
        variant: 'dateRange',
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: function Cell({ row }: { row: Row<SyncTaskRxDBDTO> }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition()

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="data-[state=open]:bg-muted flex size-8 p-0"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: 'update' })}
              >
                Edit
              </DropdownMenuItem>

              {/* Submenu refatorado para 'Change Status' */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.status.id} // Usa o ID do status
                    onValueChange={(value) => {
                      // Encontra o objeto de status completo pelo ID
                      const newStatus = allStati.find((s) => s.id === value)
                      if (!newStatus) return

                      startUpdateTransition(() => {
                        // toast.promise(
                        //   updateTask({
                        //     // Passa o objeto parcial para a action
                        //     id: row.original.id,
                        //     status: newStatus,
                        //   }),
                        //   {
                        //     loading: 'Updating...',
                        //     success: 'Status updated',
                        //     error: (err) => getErrorMessage(err),
                        //   },
                        // )
                      })
                    }}
                  >
                    {allStati.map((status) => (
                      <DropdownMenuRadioItem
                        key={status.id}
                        value={status.id}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {status.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: 'delete' })}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40,
    },
  ]
}
