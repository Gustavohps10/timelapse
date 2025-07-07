import { IRequest } from '@trackpoint/cross-cutting/transport'
import {
  AuthenticationViewModel,
  ViewModel,
} from '@trackpoint/presentation/view-models'

import { LoginRequest } from '@/main/handlers'

export interface IAuthenticationInvoker {
  login: (
    payload: IRequest<LoginRequest>,
  ) => Promise<ViewModel<AuthenticationViewModel>>
}
