import { ITaskQuery } from '@/application/contracts/data/queries/ITaskQuery'
import { ITokenStorage } from '@/application/contracts/storage/ITokenStorage'
import { ISessionManager } from '@/application/contracts/workflow/ISessionManager'
import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IHttpClient } from '@/infra/contracts/IHttpClient'
import { RedmineQueryBase } from '@/infra/data/queries/redmine/RedmineQueryBase'

export class RedmineTaskQuery extends RedmineQueryBase implements ITaskQuery {
  constructor(
    httpClient: IHttpClient,
    sessionManager: ISessionManager,
    tokenStorage: ITokenStorage,
  ) {
    super(httpClient, sessionManager, tokenStorage)
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
