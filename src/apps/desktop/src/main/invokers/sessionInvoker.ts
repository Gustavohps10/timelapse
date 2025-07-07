import { IRequest } from '@trackpoint/cross-cutting/transport'
import {
  MemberViewModel,
  ViewModel,
} from '@trackpoint/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { ISessionInvoker } from '@/main/contracts/invokers/ISessionInvoker'

/* eslint-disable prettier/prettier */
export const sessionInvoker: ISessionInvoker = {
  getCurrentUser: (): Promise<ViewModel<MemberViewModel>> => IpcInvoker.invoke<IRequest, ViewModel<MemberViewModel>>('GET_CURRENT_USER'),
}
