import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { IRequest } from '@/presentation/contracts/http'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TaskViewModel } from '@/presentation/view-models/TaskViewModel'

/* eslint-disable prettier/prettier */
export const tasksInvoker = {
  listTasks: (): Promise<PaginatedViewModel<TaskViewModel[]>> => IpcInvoker.invoke<IRequest<any>, PaginatedViewModel<TaskViewModel[]>>('TASKS_LIST')
}
