import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  AuthenticationViewModel,
  ViewModel,
} from '@trackalize/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { IAuthenticationInvoker } from '@/main/contracts/invokers'
import { LoginRequest } from '@/main/handlers'

/* eslint-disable prettier/prettier */
export const authInvoker: IAuthenticationInvoker = {
  login: <T>(payload: IRequest<LoginRequest<T>>): Promise<ViewModel<AuthenticationViewModel>> =>  IpcInvoker.invoke<IRequest<LoginRequest<T>>, ViewModel<AuthenticationViewModel>>('LOGIN', payload),
}
