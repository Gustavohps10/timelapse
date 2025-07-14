import { ICredentialsStorage } from '@trackalize/application'

interface ContextProviders {
  credentialsStorage: ICredentialsStorage
}

let providers: ContextProviders | null = null
let activeWorkspaceId: string | null = null

export const Context = {
  initialize(contextProviders: ContextProviders): void {
    providers = contextProviders
  },

  setActiveWorkspaceId(workspaceId: string | null): void {
    activeWorkspaceId = workspaceId
  },

  async getSessionData(): Promise<string | null> {
    if (!providers) throw new Error('TrackalizeContext não foi inicializado.')

    if (!activeWorkspaceId) return null

    const storedData = await providers.credentialsStorage.getToken(
      'trackalize',
      `workspace-session-${activeWorkspaceId}`,
    )
    return storedData
  },
}
