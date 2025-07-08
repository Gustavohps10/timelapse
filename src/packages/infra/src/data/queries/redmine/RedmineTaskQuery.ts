import {
  ICredentialsStorage,
  ISessionManager,
  ITaskQuery,
} from '@trackpoint/application/contracts'
import { TaskDTO } from '@trackpoint/application/dto'
import { AppError, Either } from '@trackpoint/cross-cutting/helpers'

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
