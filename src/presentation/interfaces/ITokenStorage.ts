import { ViewModel } from '@/presentation/view-models/ViewModel'

export interface ITokenStorage {
  saveToken(credentials: {
    service: string
    account: string
    token: string
  }): Promise<ViewModel<void>>
  getToken(credentials: {
    service: string
    account: string
  }): Promise<ViewModel<string | null>>
  deleteToken(credentials: {
    service: string
    account: string
  }): Promise<ViewModel<void>>
}
