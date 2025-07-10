import {
  PaginatedViewModel,
  TaskViewModel,
} from '@trackalize/presentation/view-models'

export interface ITasksInvoker {
  listTasks: () => Promise<PaginatedViewModel<TaskViewModel[]>>
}
