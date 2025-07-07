import { AppError, Either } from '@trackpoint/cross-cutting'

import { IMemberQuery } from '@/contracts/data/queries/IMemberQuery'
import { IGetCurrentUserUseCase } from '@/contracts/use-cases/IGetCurrentUserUseCase'
import { MemberDTO } from '@/dto/MemberDTO'
import { SessionManager } from '@/workflow/SessionManager'

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
