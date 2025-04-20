import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface IListTasksUseCase {
  execute(): Promise<Either<AppError, TaskDTO[]>>
}
