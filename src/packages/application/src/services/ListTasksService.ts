import {
  AppError,
  Either,
  InternalServerError,
} from '@timelapse/cross-cutting/helpers'

import { ITaskQuery } from '@/contracts'
import { IListTasksUseCase } from '@/contracts/use-cases/IListTasksUseCase'
import { IUnitOfWork } from '@/contracts/workflow/IUnitOfWork'
import { TaskDTO } from '@/dtos'
import { PagedResultDTO } from '@/dtos/pagination'

export class ListTaskService implements IListTasksUseCase {
  private readonly taskQuery: ITaskQuery

  constructor(unitOfWork: IUnitOfWork) {
    this.taskQuery = unitOfWork.taskQuery
  }

  public async execute(): Promise<Either<AppError, PagedResultDTO<TaskDTO>>> {
    try {
      const tasks = await this.taskQuery.findAll()
      return Either.success(tasks)
    } catch (error: unknown) {
      return Either.failure(InternalServerError.danger('ERRO_INESPERADO'))
    }
  }
}
