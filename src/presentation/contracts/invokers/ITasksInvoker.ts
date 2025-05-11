import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TaskViewModel } from '@/presentation/view-models/TaskViewModel'

export interface ITasksInvoker {
  listTasks: () => Promise<PaginatedViewModel<TaskViewModel[]>>
}
