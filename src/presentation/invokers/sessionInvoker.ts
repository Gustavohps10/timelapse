import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { IRequest } from '@/presentation/contracts/http'
import { ISessionInvoker } from '@/presentation/contracts/invokers/ISessionInvoker'
import { MemberViewModel } from '@/presentation/view-models/MemberViewModel'
import { ViewModel } from '@/presentation/view-models/ViewModel'

/* eslint-disable prettier/prettier */
export const sessionInvoker: ISessionInvoker = {
  getCurrentUser: (): Promise<ViewModel<MemberViewModel>> => IpcInvoker.invoke<IRequest, ViewModel<MemberViewModel>>('GET_CURRENT_USER'),
}
