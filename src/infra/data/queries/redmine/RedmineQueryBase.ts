import { IHttpClient } from '@/infra/contracts/IHttpClient'

export abstract class RedmineQueryBase {
  protected readonly baseURL = 'http://redmine.atakone.com.br'

  constructor(protected readonly httpClient: IHttpClient) {
    this.httpClient.configure({ baseURL: this.baseURL })
  }
}
