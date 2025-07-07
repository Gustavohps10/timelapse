import { IRequest } from '@trackpoint/cross-cutting/transport'
import {
  AuthenticationViewModel,
  ViewModel,
} from '@trackpoint/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { IAuthenticationInvoker } from '@/main/contracts/invokers'
import { LoginRequest } from '@/main/handlers'

/* eslint-disable prettier/prettier */
export const authInvoker: IAuthenticationInvoker = {
  login: (payload: IRequest<LoginRequest>): Promise<ViewModel<AuthenticationViewModel>> =>  IpcInvoker.invoke<IRequest<LoginRequest>, ViewModel<AuthenticationViewModel>>('LOGIN', payload),
}
