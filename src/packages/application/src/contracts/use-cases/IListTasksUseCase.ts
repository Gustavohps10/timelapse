import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { TaskDTO } from '@trackalize/presentation/dtos'

export interface IListTasksUseCase {
  execute(): Promise<Either<AppError, TaskDTO[]>>
}
