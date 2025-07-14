import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { ITaskQuery } from '@/contracts'
import { IListTasksUseCase } from '@/contracts/use-cases/IListTasksUseCase'
import { IUnitOfWork } from '@/contracts/workflow/IUnitOfWork'
import { TaskDTO } from '@/dtos'

export class ListTaskService implements IListTasksUseCase {
  private readonly taskQuery: ITaskQuery

  constructor(unitOfWork: IUnitOfWork) {
    this.taskQuery = unitOfWork.taskQuery
  }

  public async execute(): Promise<Either<AppError, TaskDTO[]>> {
    return await this.taskQuery.findAll()
  }
}
