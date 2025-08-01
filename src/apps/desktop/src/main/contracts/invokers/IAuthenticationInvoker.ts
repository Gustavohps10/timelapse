import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  AuthenticationViewModel,
  ViewModel,
} from '@trackalize/presentation/view-models'

import { LoginRequest } from '@/main/handlers'

export interface IAuthenticationInvoker {
  login: <T>(
    payload: IRequest<LoginRequest<T>>,
  ) => Promise<ViewModel<AuthenticationViewModel>>
}
