import {
  PaginatedViewModel,
  TaskViewModel,
} from '@trackpoint/presentation/view-models'

export interface ITasksInvoker {
  listTasks: () => Promise<PaginatedViewModel<TaskViewModel[]>>
}
