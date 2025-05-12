import { ISessionManager } from '@/application/contracts/workflow/ISessionManager'
import { ISessionUser } from '@/application/contracts/workflow/ISessionUser'

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
