import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { LoginRequest } from '@/presentation/handlers'
import { IAuthentication } from '@/presentation/interfaces/IAuthentication'
import { AuthenticationViewModel } from '@/presentation/view-models/AuthenticationViewModel'
import { ViewModel } from '@/presentation/view-models/ViewModel'

/* eslint-disable prettier/prettier */
export const auth: IAuthentication = {
  login: (payload: LoginRequest): Promise<ViewModel<AuthenticationViewModel>> =>  IpcInvoker.invoke<LoginRequest, ViewModel<AuthenticationViewModel>>('LOGIN', payload),
}
