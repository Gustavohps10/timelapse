import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  PaginatedViewModel,
  TaskViewModel,
} from '@trackalize/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

/* eslint-disable prettier/prettier */
export const tasksInvoker = {
  listTasks: (): Promise<PaginatedViewModel<TaskViewModel[]>> => IpcInvoker.invoke<IRequest<any>, PaginatedViewModel<TaskViewModel[]>>('TASKS_LIST')
}
