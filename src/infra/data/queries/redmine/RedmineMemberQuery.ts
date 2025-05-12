import { IMemberQuery } from '@/application/contracts/data/queries/IMemberQuery'
import { ITokenStorage } from '@/application/contracts/storage/ITokenStorage'
import { ISessionManager } from '@/application/contracts/workflow/ISessionManager'
import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IHttpClient } from '@/infra/contracts/IHttpClient'
import { RedmineQueryBase } from '@/infra/data/queries/redmine/RedmineQueryBase'

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
    tokenStorage: ITokenStorage,
  ) {
    super(httpClient, sessionManager, tokenStorage)
  }

  findMeById(id: string): Promise<Either<AppError, MemberDTO>> {
    throw new Error('Method not implemented.')
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
    const base64 = Buffer.from(`${login}:${password}`).toString('base64')

    const response = await this.httpClient.get<RedmineUserResponse>(
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
