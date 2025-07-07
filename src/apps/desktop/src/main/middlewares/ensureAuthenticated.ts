import { IJWTService, ISessionManager } from '@trackpoint/application/contracts'
import { Either } from '@trackpoint/cross-cutting'
import { IRequest } from '@trackpoint/cross-cutting/transport'
import { ViewModel } from '@trackpoint/presentation/view-models'
import { AwilixContainer } from 'awilix'

type NextFunction<TRes> = () => Promise<Either<any, TRes>>

export function createAuthMiddleware(container: AwilixContainer) {
  const jwtService = container.resolve<IJWTService>('jwtService')
  const sessionManager = container.resolve<ISessionManager>('sessionManager')

  return async function ensureAuthenticated<TReq, TRes>(
    _event: Electron.IpcMainInvokeEvent,
    request: IRequest<TReq>,
    next: NextFunction<TRes>,
  ): Promise<Either<ViewModel, TRes> | ViewModel> {
    const authHeader = request.headers?.authorization
    if (!authHeader) {
      return {
        isSuccess: false,
        statusCode: 401,
        error: 'ACESSO_NEGADO_TOKEN_NAO_FORNECIDO',
      }
    }

    const [, token] = authHeader.split(' ')
    if (!token || !jwtService.tokenIsValid(token)) {
      return {
        isSuccess: false,
        statusCode: 401,
        error: 'ACESSO_NEGADO_TOKEN_INVALIDO',
      }
    }

    const payload = jwtService.decodeToken(token)
    if (!payload) {
      return {
        isSuccess: false,
        statusCode: 401,
        error: 'ACESSO_NEGADO_PAYLOAD_INVALIDO',
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
}
