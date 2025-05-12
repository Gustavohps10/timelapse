import { DependencyInjection } from '@Ioc/DependencyInjection'

import { ISessionManager } from '@/application/contracts/workflow/ISessionManager'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IRequest } from '@/presentation/contracts/http'
import { IJWTService } from '@/presentation/contracts/IJWTService'

export async function ensureAuthenticatedMiddleware<TReq, TRes>(
  _: Electron.IpcMainInvokeEvent,
  request: IRequest<TReq>,
  next: () => Promise<Either<AppError, TRes>>,
): Promise<Either<AppError, TRes>> {
  const jwtService = DependencyInjection.get<IJWTService>('jwtService')
  const sessionManager =
    DependencyInjection.get<ISessionManager>('sessionManager')

  const authToken = request.headers?.authorization?.split(' ')[1]

  if (!authToken || !jwtService.tokenIsValid(authToken))
    return Either.failure(new AppError('ACESSO_NEGADO', undefined, 401))

  const payload = jwtService.decodeToken(authToken)

  if (!payload)
    return Either.failure(new AppError('ACESSO_NEGADO', undefined, 401))

  const { id, name } = payload

  sessionManager.setCurrentUser({
    id,
    name,
    role: 'admin',
  })

  return next()
}
