import {
  ICredentialsStorage,
  IMemberQuery,
  ISessionManager,
} from '@trackpoint/application/contracts'
import { MemberDTO } from '@trackpoint/application/dto'
import { AppError, Either } from '@trackpoint/cross-cutting/helpers'

import { IHttpClient } from '@/contracts'
import { RedmineQueryBase } from '@/data/queries/redmine/RedmineQueryBase'

type RedmineUserResponse = {
  user: MemberDTO
}

export class RedmineMemberQuery
  extends RedmineQueryBase
  implements IMemberQuery
{
  constructor(
    httpClient: IHttpClient,
    sessionManager: ISessionManager,
    credentialsStorage: ICredentialsStorage,
  ) {
    super(httpClient, sessionManager, credentialsStorage)
  }

  public async findMeById(id: string): Promise<Either<AppError, MemberDTO>> {
    const client = await this.getConfiguredHttpClient()
    const response = await client.get<RedmineUserResponse>(`/users/${id}.json`)

    if (response.isFailure()) {
      return Either.failure(
        new AppError(
          'Não foi possível obter o usuário do Redmine',
          undefined,
          403,
        ),
      )
    }

    const member = response.success.user
    return Either.success(member)
  }

  findAll(): Promise<Either<AppError, MemberDTO[]>> {
    throw new Error('Method not implemented.')
  }

  findById(id: string): Promise<Either<AppError, MemberDTO | null>> {
    throw new Error('Method not implemented.')
  }

  exists(criteria: Partial<MemberDTO>): Promise<Either<AppError, boolean>> {
    throw new Error('Method not implemented.')
  }

  public async findMeByCredentials(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>> {
    const client = await this.getConfiguredHttpClient()
    const base64 = Buffer.from(`${login}:${password}`).toString('base64')

    const response = await client.get<RedmineUserResponse>(
      '/users/current.json',
      {
        headers: {
          Authorization: `Basic ${base64}`,
        },
      },
    )

    if (response.isFailure()) {
      return Either.failure(
        new AppError(
          'Não foi possível obter o usuário do Redmine',
          undefined,
          403,
        ),
      )
    }

    const member = response.success.user
    return Either.success(member)
  }
}
