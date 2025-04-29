import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IListTasksUseCase } from '@/domain/use-cases/IListTasksUseCase'
import { DependencyInjection } from '@/Ioc/DependencyInjection'
import { IpcHandler } from '@/presentation/adapters/ipcHandler'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TaskViewModel } from '@/presentation/view-models/TaskViewModel'

export class TaskHandler {
  static register(): void {
    IpcHandler.handle<PaginatedViewModel<TaskViewModel[]>>(
      'TASKS_LIST',
      async (_event): Promise<PaginatedViewModel<TaskViewModel[]>> => {
        const listTasksService =
          DependencyInjection.get<IListTasksUseCase>('listTaskService')

        const result: Either<AppError, TaskDTO[]> =
          await listTasksService.execute()

        if (result.isFailure()) {
          return {
            isSuccess: false,
            error: 'Erro ao listar tarefas',
            data: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
          }
        }

        const tasks: TaskDTO[] = result.success

        const taskViewModels: TaskViewModel[] = tasks.map((task) => {
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          }
        })

        const totalItems = taskViewModels.length
        const pageSize = 10
        const totalPages = Math.ceil(totalItems / pageSize)

        return {
          isSuccess: true,
          data: taskViewModels,
          totalItems: totalItems,
          totalPages: totalPages,
          currentPage: 1,
        }
      },
    )
  }
}
