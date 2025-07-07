import {
  MemberViewModel,
  ViewModel,
} from '@trackpoint/presentation/view-models'

export interface ISessionInvoker {
  getCurrentUser: () => Promise<ViewModel<MemberViewModel>>
}
