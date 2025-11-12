'use client'

import { useQueryStates } from 'nuqs'
import { Suspense } from 'react'

import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { Shell } from '@/components/shell'
import { useAuth } from '@/hooks'
import { AppDatabase, useSyncStore } from '@/stores/syncStore'

import { TasksTable } from './components/tasks-table'
import {
  getAllPriorities,
  getAllstatus,
  getEstimatedHoursRange,
  getTaskPriorityCounts,
  getTasks,
  getTaskStatusCounts,
} from './lib/queries'
import { getValidFilters, tasksSearchParamsParsers } from './lib/validations'

interface ClientTasksTableWrapperProps {
  db: AppDatabase
  userId: string
}

function ClientTasksTableWrapper({ db, userId }: ClientTasksTableWrapperProps) {
  const [search] = useQueryStates(tasksSearchParamsParsers)

  const validFilters = getValidFilters(search.filters)

  console.log('Valid filters:', validFilters)
  console.log('Search params:', search)

  const promises = Promise.all([
    getTasks(db, userId, search),
    getTaskStatusCounts(db, userId),
    getTaskPriorityCounts(db, userId),
    getEstimatedHoursRange(db, userId),
    getAllstatus(db),
    getAllPriorities(db),
  ])

  return <TasksTable promises={promises} />
}

export function Backlog() {
  const db = useSyncStore((state) => state.db)
  const { user } = useAuth()
  const userId = user?.id ? String(user.id) : undefined

  if (!db || !userId) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground mt-10">Carregando dados...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Shell>
        <Suspense
          fallback={
            <DataTableSkeleton
              columnCount={7}
              filterCount={2}
              cellWidths={[
                '10rem',
                '30rem',
                '10rem',
                '10rem',
                '6rem',
                '6rem',
                '6rem',
              ]}
              shrinkZero
            />
          }
        >
          <ClientTasksTableWrapper db={db} userId={userId} />
        </Suspense>
      </Shell>
    </div>
  )
}
