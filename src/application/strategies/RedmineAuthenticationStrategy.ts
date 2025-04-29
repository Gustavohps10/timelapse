import { IMemberQuery } from '@/application/contracts/queries/IMemberQuery'
import { IAuthenticationStrategy } from '@/application/contracts/strategies/IAuthenticationStrategy'
import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export class RedmineAuthenticationStrategy implements IAuthenticationStrategy {
  constructor(private readonly memberQuery: IMemberQuery) {}

  async authenticate(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>> {
    const result = await this.memberQuery.findMeByCredentials(login, password)

    console.log(result)
    if (result.isFailure())
      return Either.failure(
        new AppError('Não foi possivel autenticar com Redmine', undefined, 404),
      )

    return Either.success(result.success)
  }
}
