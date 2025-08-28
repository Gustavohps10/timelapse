import { IServiceProvider } from '@trackalize/container'
import RedmineConnector from '@trackalize/redmine-plugin'

import { IpcHandler } from '@/main/adapters/IpcHandler'
import { handleDiscordLogin } from '@/main/auth/discord-handler'
import {
  AuthHandler,
  SessionHandler,
  TimeEntriesHandler,
  TokenHandler,
} from '@/main/handlers'
import { WorkspacesHandler } from '@/main/handlers/WorkspacesHandler'
import { createAuthMiddleware } from '@/main/middlewares/ensureAuthenticated'
import { createInjectConnectorMiddleware } from '@/main/middlewares/injectConnector'

export function openIpcRoutes(serviceProvider: IServiceProvider): void {
  const ensureAuthenticated = createAuthMiddleware(serviceProvider)
  const injectConnector = createInjectConnectorMiddleware(serviceProvider)

  /* eslint-disable prettier/prettier */
  IpcHandler.register('WORKSPACES_CREATE', (event, req) => {
    const workspacesHandler = serviceProvider.resolve<WorkspacesHandler>('workspacesHandler')
    return workspacesHandler.create(event, req)
  })

  IpcHandler.register('WORKSPACES_GET_ALL', () => {
    const workspacesHandler = serviceProvider.resolve<WorkspacesHandler>('workspacesHandler')
    return workspacesHandler.listAll()
  })

  IpcHandler.register('PLUGIN_GET_FIELDS', async () => RedmineConnector.configFields)

  IpcHandler.register('DISCORD_LOGIN', () => handleDiscordLogin())

  IpcHandler.register('SAVE_TOKEN', (event, req) => {
    const tokenHandler = serviceProvider.resolve<TokenHandler>('tokenHandler')
    return tokenHandler.saveToken(event, req)
  })

  IpcHandler.register('GET_TOKEN', (event, req) => {
    const tokenHandler = serviceProvider.resolve<TokenHandler>('tokenHandler')
    return tokenHandler.getToken(event, req)
  })

  IpcHandler.register('DELETE_TOKEN', (event, req) => {
    const tokenHandler = serviceProvider.resolve<TokenHandler>('tokenHandler')
    return tokenHandler.deleteToken(event, req)
  })

  IpcHandler.register('GET_CURRENT_USER', [ensureAuthenticated, injectConnector], (event, req) => {
    const sessionHandler = serviceProvider.resolve<SessionHandler>('sessionHandler')
    return sessionHandler.listTimeEntries(event, req)
  })

  IpcHandler.register('LOGIN', [injectConnector], (event, req) => {
    const authHandler = serviceProvider.resolve<AuthHandler>('authHandler')
    return authHandler.login(event, req)
  })

  IpcHandler.register('LIST_TIME_ENTRIES', [ensureAuthenticated, injectConnector], (event, req) => {
    const timeEntriesHandler = serviceProvider.resolve<TimeEntriesHandler>('timeEntriesHandler')
    return timeEntriesHandler.listTimeEntries(event, req)
  })
  /* eslint-enable prettier/prettier */
}
