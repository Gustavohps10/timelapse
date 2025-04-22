import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { ListTaskViewModel } from '@/presentation/view-models/ListTasksViewModel'

export const tasks = {
  listTasks: (): Promise<ListTaskViewModel> =>
    IpcInvoker.invoke<ListTaskViewModel>('TASKS_LIST'),
}
