import { ConnectorRuntimeContext, Context } from '@trackalize/connector-sdk'
import axios, { AxiosInstance } from 'axios'

export abstract class RedmineBase {
  private readonly context: ConnectorRuntimeContext
  private apiClient: AxiosInstance | null = null

  constructor(context: ConnectorRuntimeContext) {
    this.context = context
  }

  protected async getAuthenticatedClient(): Promise<AxiosInstance> {
    if (this.apiClient) {
      return this.apiClient
    }

    const sessionDataString = await Context.getSessionData()
    const sessionData = sessionDataString ? JSON.parse(sessionDataString) : null
    const apiKey = sessionData?.apiKey

    const headers: Record<string, string> = {}
    if (apiKey) {
      headers['X-Redmine-API-Key'] = apiKey
    }

    this.apiClient = axios.create({
      baseURL: this.context.workspaceConfig.apiUrl,
      headers,
    })

    return this.apiClient
  }
}
