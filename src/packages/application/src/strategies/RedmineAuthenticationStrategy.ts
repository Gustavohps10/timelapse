import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { IMemberQuery } from '@/contracts/data/queries/IMemberQuery'
import { ICredentialsStorage } from '@/contracts/storage/ICredentialsStorage'
import { IAuthenticationStrategy } from '@/contracts/strategies/IAuthenticationStrategy'
import { IUnitOfWork } from '@/contracts/workflow/IUnitOfWork'
import { MemberDTO } from '@/dto/MemberDTO'

export class RedmineAuthenticationStrategy implements IAuthenticationStrategy {
  private readonly memberQuery: IMemberQuery
  private readonly credentialsStorage: ICredentialsStorage

  constructor(
    unitOfWork: IUnitOfWork,
    credentialsStorage: ICredentialsStorage,
  ) {
    this.memberQuery = unitOfWork.memberQuery
    this.credentialsStorage = credentialsStorage
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
    await this.credentialsStorage.saveToken('trackalize', key, member.api_key)

    return Either.success(member)
  }
}
