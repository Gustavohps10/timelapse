import { IRequest } from '@/presentation/contracts/http'
import { LoginRequest } from '@/presentation/handlers'
import { AuthenticationViewModel } from '@/presentation/view-models/AuthenticationViewModel'
import { ViewModel } from '@/presentation/view-models/ViewModel'

export interface IAuthenticationInvoker {
  login: (
    payload: IRequest<LoginRequest>,
  ) => Promise<ViewModel<AuthenticationViewModel>>
}
