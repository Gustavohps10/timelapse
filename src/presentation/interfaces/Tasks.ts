import { ListTaskViewModel } from '@/presentation/view-models/ListTasksViewModel'

export interface Tasks {
  listTasks: () => Promise<ListTaskViewModel>
}
