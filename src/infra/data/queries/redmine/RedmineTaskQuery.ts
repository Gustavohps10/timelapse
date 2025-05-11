import { ITaskQuery } from '@/application/contracts/data/queries/ITaskQuery'
import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IHttpClient } from '@/infra/contracts/IHttpClient'
import { RedmineQueryBase } from '@/infra/data/queries/redmine/RedmineQueryBase'

export class RedmineTaskQuery extends RedmineQueryBase implements ITaskQuery {
  constructor(httpClient: IHttpClient) {
    super(httpClient)
  }

  exists(criteria: Partial<TaskDTO>): Promise<Either<AppError, boolean>> {
    throw new Error('Method not implemented.')
  }

  public async findById(id: string): Promise<Either<AppError, TaskDTO>> {
    throw new Error('Method not implemented.')
  }
  public async findAll(): Promise<Either<AppError, TaskDTO[]>> {
    throw new Error('Method not implemented.')
  }
}
