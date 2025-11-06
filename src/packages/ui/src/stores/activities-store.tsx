import { create } from 'zustand'

import type { SyncTaskRxDBDTO } from '@/sync/tasks-sync-schema'

type ColumnsMap = Map<string, SyncTaskRxDBDTO[]>

interface ActivitiesState {
  columns: ColumnsMap
  setColumns: (
    tasks: SyncTaskRxDBDTO[],
    statuses: { id: string; name: string }[],
  ) => void
  reorderSameColumn: (
    colId: string,
    startIndex: number,
    endIndex: number,
  ) => void
  moveBetweenColumns: (
    sourceColId: string,
    destColId: string,
    sourceIndex: number,
    destIndex: number,
  ) => void
}

export const useActivitiesStore = create<ActivitiesState>((set) => ({
  columns: new Map(),

  setColumns: (tasks, statuses) => {
    const newColumns: ColumnsMap = new Map()

    statuses.forEach((status) => newColumns.set(status.name, []))

    tasks.forEach((task) => {
      if (newColumns.has(task.status.name)) {
        newColumns.get(task.status.name)?.push(task)
      }
    })
    set({ columns: newColumns })
  },

  reorderSameColumn: (colId, startIndex, endIndex) => {
    set((state) => {
      const newColumns = new Map(state.columns)
      const column = Array.from(newColumns.get(colId) || [])
      const [removed] = column.splice(startIndex, 1)
      column.splice(endIndex, 0, removed)
      newColumns.set(colId, column)
      return { columns: newColumns }
    })
  },

  moveBetweenColumns: (sourceColId, destColId, sourceIndex, destIndex) => {
    set((state) => {
      const newColumns = new Map(state.columns)
      const sourceColumn = Array.from(newColumns.get(sourceColId) || [])
      const destColumn = Array.from(newColumns.get(destColId) || [])

      const [movedTask] = sourceColumn.splice(sourceIndex, 1)
      destColumn.splice(destIndex, 0, movedTask)

      newColumns.set(sourceColId, sourceColumn)
      newColumns.set(destColId, destColumn)

      return { columns: newColumns }
    })
  },
}))
