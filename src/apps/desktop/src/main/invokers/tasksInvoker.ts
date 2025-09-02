import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  PaginatedViewModel,
  TaskViewModel,
} from '@timelapse/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

/* eslint-disable prettier/prettier */
export const tasksInvoker = {
  listTasks: (): Promise<PaginatedViewModel<TaskViewModel[]>> => IpcInvoker.invoke<IRequest<any>, PaginatedViewModel<TaskViewModel[]>>('TASKS_LIST')
}
