import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TaskViewModel } from '@/presentation/view-models/TaskViewModel'

/* eslint-disable prettier/prettier */
export const tasks = {
  listTasks: (): Promise<PaginatedViewModel<TaskViewModel[]>> => IpcInvoker.invoke<undefined, PaginatedViewModel<TaskViewModel[]>>('TASKS_LIST')
}
