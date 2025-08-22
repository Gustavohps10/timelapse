import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  MemberViewModel,
  ViewModel,
} from '@trackalize/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { ISessionInvoker } from '@/main/contracts/invokers/ISessionInvoker'

/* eslint-disable prettier/prettier */
export const sessionInvoker: ISessionInvoker = {
  getCurrentUser: (
    input: IRequest<{
      workspaceId: string
    }>,
  ): Promise<ViewModel<MemberViewModel>> => IpcInvoker.invoke<IRequest<{
      workspaceId: string
    }>, ViewModel<MemberViewModel>>('GET_CURRENT_USER', input),
}
