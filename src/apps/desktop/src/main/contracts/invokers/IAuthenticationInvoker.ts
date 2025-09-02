import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  AuthenticationViewModel,
  ViewModel,
} from '@timelapse/presentation/view-models'

import { LoginRequest } from '@/main/handlers'

export interface IAuthenticationInvoker {
  login: <T>(
    payload: IRequest<LoginRequest<T>>,
  ) => Promise<ViewModel<AuthenticationViewModel>>
}
