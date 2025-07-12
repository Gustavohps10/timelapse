import { ITaskQuery } from '@trackalize/connector-sdk/contracts'
import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { TaskDTO } from '@trackalize/presentation/dtos'

import { IListTasksUseCase } from '@/contracts/use-cases/IListTasksUseCase'
import { IUnitOfWork } from '@/contracts/workflow/IUnitOfWork'

export class ListTaskService implements IListTasksUseCase {
  private readonly taskQuery: ITaskQuery

  constructor(unitOfWork: IUnitOfWork) {
    this.taskQuery = unitOfWork.taskQuery
  }

  public async execute(): Promise<Either<AppError, TaskDTO[]>> {
    return await this.taskQuery.findAll()
  }
}
