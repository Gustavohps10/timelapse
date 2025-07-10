import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { TaskDTO } from '@/dto/TaskDTO'

export interface IListTasksUseCase {
  execute(): Promise<Either<AppError, TaskDTO[]>>
}
