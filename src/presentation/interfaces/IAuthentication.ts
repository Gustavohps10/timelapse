import { LoginRequest } from '@/presentation/handlers'
import { AuthenticationViewModel } from '@/presentation/view-models/AuthenticationViewModel'
import { ViewModel } from '@/presentation/view-models/ViewModel'

export interface IAuthentication {
  login: (payload: LoginRequest) => Promise<ViewModel<AuthenticationViewModel>>
}
