'use client'

import * as React from 'react'

import type { DataTableRowAction, QueryKeys } from '@/@types/data-table'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar'
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list'
import { DataTableFilterMenu } from '@/components/data-table/data-table-filter-menu'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'
import { useDataTable } from '@/hooks/use-data-table'

// Presumindo que você tenha queries para buscar todas as opções
import type {
  getAllPriorities, // Adicionado
  getAllStati, // Adicionado
  getEstimatedHoursRange,
  getTaskPriorityCounts,
  getTasks,
  getTaskStatusCounts,
} from '../lib/queries'
import { useFeatureFlags } from './feature-flags-provider'
// import { TasksTableActionBar } from './tasks-table-action-bar'
import { getTasksTableColumns } from './tasks-table-columns'
// import { UpdateTaskSheet } from './update-task-sheet'

interface TasksTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getTasks>>,
      Awaited<ReturnType<typeof getTaskStatusCounts>>,
      Awaited<ReturnType<typeof getTaskPriorityCounts>>,
      Awaited<ReturnType<typeof getEstimatedHoursRange>>,
      Awaited<ReturnType<typeof getAllStati>>, // Adicionado
      Awaited<ReturnType<typeof getAllPriorities>>, // Adicionado
    ]
  >
  queryKeys?: Partial<QueryKeys>
}

export function TasksTable({ promises, queryKeys }: TasksTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags()

  // Atualizado para extrair os novos dados
  const [
    { data, pageCount },
    statusCounts,
    priorityCounts,
    estimatedHoursRange,
    allStati,
    allPriorities,
  ] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<SyncTaskRxDBDTO> | null>(null)

  const columns = React.useMemo(
    () =>
      getTasksTableColumns({
        statusCounts,
        priorityCounts,
        estimatedHoursRange,
        allStati, // Passado para a função
        allPriorities, // Passado para a função
        setRowAction,
      }),
    [
      statusCounts,
      priorityCounts,
      estimatedHoursRange,
      allStati,
      allPriorities,
    ], // Adicionado às dependências
  )

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: 'updatedAt', desc: true }], // 'updatedAt' existe no DTO
      columnPinning: { right: ['actions'] },
    },
    queryKeys,
    getRowId: (originalRow) => originalRow.id, // 'id' existe no DTO
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable
        table={table}
        // actionBar={<TasksTableActionBar table={table} />}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableSortList table={table} align="start" />
            {filterFlag === 'advancedFilters' ? (
              <DataTableFilterList
                table={table}
                shallow={shallow}
                debounceMs={debounceMs}
                throttleMs={throttleMs}
                align="start"
              />
            ) : (
              <DataTableFilterMenu
                table={table}
                shallow={shallow}
                debounceMs={debounceMs}
                throttleMs={throttleMs}
              />
            )}
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} align="end" />
          </DataTableToolbar>
        )}
      </DataTable>
      {/* <UpdateTaskSheet
        open={rowAction?.variant === 'update'}
        onOpenChange={() => setRowAction(null)}
        task={rowAction?.row.original ?? null}
      /> */}
      {/* <DeleteTasksDialog
        open={rowAction?.variant === 'delete'}
        onOpenChange={() => setRowAction(null)}
        tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      /> */}
    </>
  )
}
