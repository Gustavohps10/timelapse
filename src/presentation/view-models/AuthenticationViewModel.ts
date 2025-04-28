import { MemberViewModel } from '@/presentation/view-models/MemberViewModel'

export interface AuthenticationViewModel {
  member: MemberViewModel
  token: string
  key?: string
}
