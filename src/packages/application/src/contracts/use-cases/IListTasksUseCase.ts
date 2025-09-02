import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { PagedResultDTO, TaskDTO } from '@/dtos'

export interface IListTasksUseCase {
  execute(): Promise<Either<AppError, PagedResultDTO<TaskDTO>>>
}
