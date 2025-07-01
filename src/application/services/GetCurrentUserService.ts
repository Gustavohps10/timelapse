import { IMemberQuery } from '@/application/contracts/data/queries/IMemberQuery'
import { MemberDTO } from '@/application/dto/MemberDTO'
import { SessionManager } from '@/application/workflow/SessionManager'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IGetCurrentUserUseCase } from '@/domain/use-cases/IGetCurrentUserUseCase'

export class GetCurrentUserService implements IGetCurrentUserUseCase {
  constructor(
    private readonly sessionManager: SessionManager,
    private readonly memberQuery: IMemberQuery,
  ) {}

  public async execute(): Promise<Either<AppError, MemberDTO>> {
    const sessionUser = this.sessionManager.getCurrentUser()

    if (!sessionUser)
      return Either.failure(
        new AppError('NAO_FOI_POSSIVEL_OBTER_USUARIO', '', 422),
      )

    return await this.memberQuery.findMeById(sessionUser.id)
  }
}
