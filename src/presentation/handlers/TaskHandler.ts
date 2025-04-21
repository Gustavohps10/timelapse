import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IListTasksUseCase } from '@/domain/use-cases/IListTasksUseCase'
import { DependencyInjection } from '@/Ioc/DependencyInjection'
import { InterfaceMapping } from '@/Ioc/interface-mapping'
import { IpcHandler } from '@/presentation/adapters/ipcHandler'
import { ListTaskViewModel } from '@/presentation/view-models/ListTasksViewModel'

export class TaskHandler {
  static register(): void {
    /**
     * Canal Responsável por listar as Tarefas
     */
    IpcHandler.handle<ListTaskViewModel>(
      'TASKS_LIST',
      async (_event): Promise<ListTaskViewModel> => {
        const listTasksService = DependencyInjection.get<IListTasksUseCase>(
          InterfaceMapping.IListTasksUseCase,
        )

        const result: Either<AppError, TaskDTO[]> =
          await listTasksService.execute()

        if (result.isFailure()) {
          return new ListTaskViewModel(
            result.isSuccess(),
            [],
            result.failure.messageKey,
          )
        }

        return new ListTaskViewModel(
          result.isSuccess(),
          result.success,
          '',
          100,
          10,
          1,
        )
      },
    )
  }
}
