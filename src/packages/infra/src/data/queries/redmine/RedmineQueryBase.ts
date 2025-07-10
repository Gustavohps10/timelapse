import {
  ICredentialsStorage,
  ISessionManager,
} from '@trackalize/application/contracts'

import { IHttpClient } from '@/contracts'

export abstract class RedmineQueryBase {
  protected readonly baseURL = 'http://redmine.atakone.com.br'
  private isConfigured = false

  constructor(
    private readonly httpClient: IHttpClient,
    protected readonly sessionManager: ISessionManager,
    protected readonly credentialsStorage: ICredentialsStorage,
  ) {}

  protected async getConfiguredHttpClient(): Promise<IHttpClient> {
    if (!this.isConfigured) {
      await this.configureHttpClient()
      this.isConfigured = true
    }
    return this.httpClient
  }

  private async configureHttpClient(): Promise<void> {
    console.log('------- CONFIGURANDO HTTP CLIENT')
    const user = this.sessionManager.getCurrentUser()

    if (!user) {
      this.httpClient.configure({
        baseURL: this.baseURL,
      })
      return
    }

    const storageKey = `redmine-key-${user.id}`
    const key = await this.credentialsStorage.getToken('trackalize', storageKey)

    const params: Record<string, string> = {}

    if (key) params.key = key

    this.httpClient.configure({
      baseURL: this.baseURL,
      params,
    })
  }
}
