import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  AuthenticationViewModel,
  ViewModel,
} from '@timelapse/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { IAuthenticationInvoker } from '@/main/contracts/invokers'
import { LoginRequest } from '@/main/handlers'

/* eslint-disable prettier/prettier */
export const authInvoker: IAuthenticationInvoker = {
  login: <T>(payload: IRequest<LoginRequest<T>>): Promise<ViewModel<AuthenticationViewModel>> =>  IpcInvoker.invoke<IRequest<LoginRequest<T>>, ViewModel<AuthenticationViewModel>>('LOGIN', payload),
}
