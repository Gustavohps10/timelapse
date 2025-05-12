import { ITokenStorage } from '@/application/contracts/storage/ITokenStorage'
import { ISessionManager } from '@/application/contracts/workflow/ISessionManager'
import { IHttpClient } from '@/infra/contracts/IHttpClient'

export abstract class RedmineQueryBase {
  protected readonly baseURL = 'http://redmine.atakone.com.br'
  protected userKey?: string = undefined

  constructor(
    protected readonly httpClient: IHttpClient,
    protected readonly sessionManager: ISessionManager,
    protected readonly tokenStorage: ITokenStorage,
  ) {
    this.configureHttpClient()
  }

  private async configureHttpClient(): Promise<void> {
    const user = this.sessionManager.getCurrentUser()
    const storageKey = `redmine-key-${user?.id}`

    const key = await this.tokenStorage.getToken('atask', storageKey)

    if (!key) {
      this.httpClient.configure({
        baseURL: this.baseURL,
      })
      return
    }

    this.httpClient.configure({
      baseURL: this.baseURL,
      params: {
        key,
      },
    })
  }
}
