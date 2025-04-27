import { ITaskQuery } from '@/application/contracts/queries/ITaskQuery'
import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export class TaskQuery implements ITaskQuery {
  exists(id: string): Promise<Either<AppError, boolean>> {
    throw new Error('Method not implemented.')
  }
  findById(id: string): Promise<Either<AppError, TaskDTO>> {
    throw new Error('Method not implemented.')
  }
  findAll(): Promise<Either<AppError, TaskDTO[]>> {
    throw new Error('Method not implemented.')
  }
}
