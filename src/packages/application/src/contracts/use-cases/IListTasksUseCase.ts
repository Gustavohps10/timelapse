import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { TaskDTO } from '@/dtos'

export interface IListTasksUseCase {
  execute(): Promise<Either<AppError, TaskDTO[]>>
}
