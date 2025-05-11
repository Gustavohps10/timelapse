import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { IRequest } from '@/presentation/contracts/http'
import { IAuthenticationInvoker } from '@/presentation/contracts/invokers'
import { LoginRequest } from '@/presentation/handlers'
import { AuthenticationViewModel } from '@/presentation/view-models/AuthenticationViewModel'
import { ViewModel } from '@/presentation/view-models/ViewModel'

/* eslint-disable prettier/prettier */
export const authInvoker: IAuthenticationInvoker = {
  login: (payload: IRequest<LoginRequest>): Promise<ViewModel<AuthenticationViewModel>> =>  IpcInvoker.invoke<IRequest<LoginRequest>, ViewModel<AuthenticationViewModel>>('LOGIN', payload),
}
