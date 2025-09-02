import { IRequest } from '@timelapse/cross-cutting/transport'
import { MemberViewModel, ViewModel } from '@timelapse/presentation/view-models'

export interface ISessionInvoker {
  getCurrentUser: (
    input: IRequest<{
      workspaceId: string
    }>,
  ) => Promise<ViewModel<MemberViewModel>>
}
