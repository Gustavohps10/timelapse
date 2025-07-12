import {
  ICredentialsStorage,
  ISessionManager,
} from '@trackalize/application/contracts'
import { ITaskQuery } from '@trackalize/connector-sdk/contracts'
import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { TaskDTO } from '@trackalize/presentation/dtos'

import { IHttpClient } from '@/contracts'
import { RedmineQueryBase } from '@/data/queries/redmine/RedmineQueryBase'

export class RedmineTaskQuery extends RedmineQueryBase implements ITaskQuery {
  constructor(
    httpClient: IHttpClient,
    sessionManager: ISessionManager,
    credentialsStorage: ICredentialsStorage,
  ) {
    super(httpClient, sessionManager, credentialsStorage)
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
