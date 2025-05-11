import { ITaskQuery } from '@/application/contracts/data/queries/ITaskQuery'
import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IListTasksUseCase } from '@/domain/use-cases/IListTasksUseCase'

export class ListTaskService implements IListTasksUseCase {
  private readonly taskQuery: ITaskQuery

  constructor(unitOfWork) {
    this.taskQuery = unitOfWork.taskQuery
  }

  public async execute(): Promise<Either<AppError, TaskDTO[]>> {
    return await this.taskQuery.findAll()
  }
}
