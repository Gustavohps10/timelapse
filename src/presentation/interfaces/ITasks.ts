import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TaskViewModel } from '@/presentation/view-models/TaskViewModel'

export interface ITasks {
  listTasks: () => Promise<PaginatedViewModel<TaskViewModel[]>>
}
