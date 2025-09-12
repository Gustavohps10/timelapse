import { ISessionClient } from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import { MemberViewModel, ViewModel } from '@timelapse/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

/* eslint-disable prettier/prettier */
export const sessionInvoker: ISessionClient = {
  getCurrentUser: (
    input: IRequest<{
      workspaceId: string
    }>,
  ): Promise<ViewModel<MemberViewModel>> => IpcInvoker.invoke<IRequest<{
      workspaceId: string
    }>, ViewModel<MemberViewModel>>('GET_CURRENT_USER', input),
}
