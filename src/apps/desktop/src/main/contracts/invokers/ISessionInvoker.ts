import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  MemberViewModel,
  ViewModel,
} from '@trackalize/presentation/view-models'

export interface ISessionInvoker {
  getCurrentUser: (
    input: IRequest<{
      workspaceId: string
    }>,
  ) => Promise<ViewModel<MemberViewModel>>
}
