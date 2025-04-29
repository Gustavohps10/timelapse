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

    if (result.isFailure()) return result

    const member = result.success

    if (!member) {
      return Either.failure(
        new AppError('Não foi possivel autenticar com Redmine', undefined, 404),
      )
    }

    return Either.success(member)
  }
}
