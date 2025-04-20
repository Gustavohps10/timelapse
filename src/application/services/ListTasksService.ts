import { ITaskRepository } from '@/application/contracts/ITaskRepository'
import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IListTasksUseCase } from '@/domain/use-cases/IListTasksUseCase'

export class ListTaskService implements IListTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  public async execute(): Promise<Either<AppError, TaskDTO[]>> {
    return await this.taskRepository.findAll()
  }
}
