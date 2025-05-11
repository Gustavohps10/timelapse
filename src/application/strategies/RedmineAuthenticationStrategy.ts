import { IMemberQuery } from '@/application/contracts/data/queries/IMemberQuery'
import { ITokenStorage } from '@/application/contracts/storage/ITokenStorage'
import { IAuthenticationStrategy } from '@/application/contracts/strategies/IAuthenticationStrategy'
import { IUnitOfWork } from '@/application/contracts/workflow/IUnitOfWork'
import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export class RedmineAuthenticationStrategy implements IAuthenticationStrategy {
  private readonly memberQuery: IMemberQuery
  private readonly tokenStorage: ITokenStorage

  constructor(unitOfWork: IUnitOfWork, tokenStorage: ITokenStorage) {
    this.memberQuery = unitOfWork.memberQuery
    this.tokenStorage = tokenStorage
  }

  async authenticate(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>> {
    const result = await this.memberQuery.findMeByCredentials(login, password)

    if (result.isFailure()) {
      return Either.failure(
        new AppError('Não foi possível autenticar com Redmine', undefined, 404),
      )
    }

    const member = result.success

    const key = `redmine-key-${member.id}`
    await this.tokenStorage.saveToken('atask', key, member.api_key)

    return Either.success(member)
  }
}
