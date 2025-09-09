import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { IMemberQuery } from '@/contracts'
import { IGetCurrentUserUseCase } from '@/contracts/use-cases/IGetCurrentUserUseCase'
import { MemberDTO } from '@/dtos'
import { SessionManager } from '@/workflow/SessionManager'

export class GetCurrentUserService implements IGetCurrentUserUseCase {
  constructor(
    private readonly sessionManager: SessionManager,
    private readonly memberQuery: IMemberQuery,
  ) {}

  public async execute(): Promise<Either<AppError, MemberDTO>> {
    try {
      const sessionUser = this.sessionManager.getCurrentUser()
      if (!sessionUser)
        return Either.failure(
          new AppError('NAO_FOI_POSSIVEL_OBTER_USUARIO', '', 422),
        )
      const user = await this.memberQuery.findById(sessionUser.id)

      if (!user)
        return Either.failure(
          new AppError('NAO_FOI_POSSIVEL_OBTER_USUARIO', '', 422),
        )

      return Either.success(user)
    } catch (erro: unknown) {
      return Either.failure(
        new AppError('NAO_FOI_POSSIVEL_OBTER_USUARIO', '', 422),
      )
    }
  }
}
