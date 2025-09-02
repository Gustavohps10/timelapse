import {
  PaginatedViewModel,
  TaskViewModel,
} from '@timelapse/presentation/view-models'

export interface ITasksInvoker {
  listTasks: () => Promise<PaginatedViewModel<TaskViewModel[]>>
}
