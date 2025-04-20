import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface ITaskRepository {
  create(taskData: TaskDTO): Promise<Either<AppError, TaskDTO>>
  exists(id: string): Promise<Either<AppError, boolean>>
  findById(id: string): Promise<Either<AppError, TaskDTO>>
  findAll(): Promise<Either<AppError, TaskDTO[]>>
}
