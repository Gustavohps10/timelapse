import { ISessionUser } from '@/application/contracts/workflow/ISessionUser'

export interface ISessionManager {
  getCurrentUser(): ISessionUser | undefined
  clearSession(): void
  setCurrentUser(user: ISessionUser): void
}
