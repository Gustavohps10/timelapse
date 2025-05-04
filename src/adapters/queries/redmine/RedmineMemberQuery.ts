import { IHttpClient } from '@/adapters/interfaces/IHttpClient'
import { IMemberQuery } from '@/application/contracts/queries/IMemberQuery'
import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

type RedmineUserResponse = {
  user: MemberDTO
}

export class RedmineMemberQuery implements IMemberQuery {
  constructor(private readonly httpClient: IHttpClient) {
    this.httpClient.configure('http://redmine.atakone.com.br')
  }

  public async findMeById(id: string): Promise<Either<AppError, MemberDTO>> {
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
