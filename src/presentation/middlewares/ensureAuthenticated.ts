import { DependencyInjection } from '@Ioc/DependencyInjection'

import { ISessionManager } from '@/application/contracts/workflow/ISessionManager'
import { Either } from '@/cross-cutting/Either'
import { IRequest } from '@/presentation/contracts/http'
import { IJWTService } from '@/presentation/contracts/IJWTService'
import { ViewModel } from '@/presentation/view-models/ViewModel'

export async function ensureAuthenticated<TReq, TRes>(
  _: Electron.IpcMainInvokeEvent,
  request: IRequest<TReq>,
  next: () => Promise<Either<any, TRes>>,
): Promise<Either<ViewModel, TRes> | ViewModel> {
  const scope = DependencyInjection.createOrGetScope()

  const jwtService = scope.resolve<IJWTService>('jwtService')
  const sessionManager = scope.resolve<ISessionManager>('sessionManager')

  const authToken = request.headers?.authorization?.split(' ')[1]

  if (!authToken || !jwtService.tokenIsValid(authToken)) {
    return {
      isSuccess: false,
      statusCode: 401,
      error: 'ACESSO_NEGADO',
    }
  }

  const payload = jwtService.decodeToken(authToken)

  if (!payload) {
    return {
      isSuccess: false,
      statusCode: 401,
      error: 'ACESSO_NEGADO',
    }
  }

  const { id, name } = payload

  sessionManager.setCurrentUser({
    id,
    name,
    role: 'admin',
  })

  return next()
}
