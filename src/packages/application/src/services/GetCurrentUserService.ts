import {
  AppError,
  Either,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '@timelapse/cross-cutting/helpers'

import { IGetCurrentUserUseCase, IMemberQuery } from '@/contracts'
import { MemberDTO } from '@/dtos'
import { SessionManager } from '@/workflow'

export class GetCurrentUserService implements IGetCurrentUserUseCase {
  constructor(
    private readonly sessionManager: SessionManager,
    private readonly memberQuery: IMemberQuery,
  ) {}

  public async execute(): Promise<Either<AppError, MemberDTO>> {
    try {
      const sessionUser = this.sessionManager.getCurrentUser()
      if (!sessionUser)
        return Either.failure(UnauthorizedError.danger('USUARIO_NAO_LOGADO'))

      const user = await this.memberQuery.findById(sessionUser.id)
      if (!user)
        return Either.failure(NotFoundError.danger('USUARIO_NAO_ENCONTRADO'))

      return Either.success(user)
    } catch (erro: unknown) {
      return Either.failure(InternalServerError.danger('ERRO_AO_OBTER_USUARIO'))
    }
  }
}
