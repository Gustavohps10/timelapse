import { ITaskClient } from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  PaginatedViewModel,
  TaskViewModel,
} from '@timelapse/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

export const tasksInvoker: ITaskClient = {
  listTasks: (): Promise<PaginatedViewModel<TaskViewModel[]>> =>
    IpcInvoker.invoke<IRequest<any>, PaginatedViewModel<TaskViewModel[]>>(
      'TASKS_LIST',
    ),
}
