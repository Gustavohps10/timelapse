import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IListTasksUseCase } from '@/domain/use-cases/IListTasksUseCase'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TaskViewModel } from '@/presentation/view-models/TaskViewModel'

export class TaskHandler {
  constructor(private readonly listTasksService: IListTasksUseCase) {}

  public async listTasks(
    _event: Electron.IpcMainInvokeEvent,
    _request?: any,
  ): Promise<PaginatedViewModel<TaskViewModel[]>> {
    const result: Either<AppError, TaskDTO[]> =
      await this.listTasksService.execute()

    if (result.isFailure()) {
      return {
        statusCode: 500,
        isSuccess: false,
        error: 'Erro ao listar tarefas',
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
      }
    }

    const tasks: TaskDTO[] = result.success

    const taskViewModels: TaskViewModel[] = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }))

    const totalItems = taskViewModels.length
    const pageSize = 10
    const totalPages = Math.ceil(totalItems / pageSize)

    return {
      statusCode: 200,
      isSuccess: true,
      data: taskViewModels,
      totalItems,
      totalPages,
      currentPage: 1,
    }
  }
}
