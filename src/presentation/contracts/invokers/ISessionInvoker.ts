import { MemberViewModel } from '@/presentation/view-models/MemberViewModel'
import { ViewModel } from '@/presentation/view-models/ViewModel'

export interface ISessionInvoker {
  getCurrentUser: () => Promise<ViewModel<MemberViewModel>>
}
