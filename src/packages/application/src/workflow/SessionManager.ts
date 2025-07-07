import { ISessionManager } from '@/contracts/workflow/ISessionManager'
import { ISessionUser } from '@/contracts/workflow/ISessionUser'

export class SessionManager implements ISessionManager {
  #currentUser?: ISessionUser

  public getCurrentUser(): ISessionUser | undefined {
    return this.#currentUser
  }

  public clearSession(): void {
    this.#currentUser = undefined
  }

  public setCurrentUser(user: ISessionUser): void {
    this.#currentUser = user
  }
}
