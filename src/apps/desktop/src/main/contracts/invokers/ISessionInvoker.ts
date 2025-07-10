import {
  MemberViewModel,
  ViewModel,
} from '@trackalize/presentation/view-models'

export interface ISessionInvoker {
  getCurrentUser: () => Promise<ViewModel<MemberViewModel>>
}
