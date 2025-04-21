import { IpcHandler } from '@/presentation/adapters/ipcHandler'
import { ListTaskViewModel } from '@/presentation/view-models/ListTasksViewModel'

export const tasks = {
  listTasks: (): Promise<ListTaskViewModel> =>
    IpcHandler.invoke<ListTaskViewModel>('TASKS_LIST'),
}
