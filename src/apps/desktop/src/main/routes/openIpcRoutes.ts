import { IServiceProvider } from '@trackalize/container'
import RedmineConnector from '@trackalize/redmine-plugin'

import { IpcHandler } from '@/main/adapters/IpcHandler'
import { handleDiscordLogin } from '@/main/auth/discord-handler'
import {
  ConnectionHandler,
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

   IpcHandler.register('WORKSPACES_GET_BY_ID', (event, req) => {
    const workspacesHandler = serviceProvider.resolve<WorkspacesHandler>('workspacesHandler')
    return workspacesHandler.getById(event, req)
  })

  IpcHandler.register('WORKSPACES_GET_ALL', () => {
    const workspacesHandler = serviceProvider.resolve<WorkspacesHandler>('workspacesHandler')
    return workspacesHandler.listAll()
  })

  IpcHandler.register('WORKSPACES_LINK_DATASOURCE', (event, req) => {
    const workspacesHandler = serviceProvider.resolve<WorkspacesHandler>('workspacesHandler')
    return workspacesHandler.linkDataSource(event, req)
  })

  IpcHandler.register('WORKSPACES_UNLINK_DATASOURCE', (event, req) => {
    const workspacesHandler = serviceProvider.resolve<WorkspacesHandler>('workspacesHandler')
    return workspacesHandler.unlinkDataSource(event, req)
  })

  IpcHandler.register('WORKSPACES_CONNECT_DATASOURCE', [injectConnector], (event, req) => {
    const connectionHandler = serviceProvider.resolve<ConnectionHandler>('connectionHandler')
    return connectionHandler.connectDataSource(event, req)
  })

  IpcHandler.register('WORKSPACES_DISCONNECT_DATASOURCE', [injectConnector], (event, req) => {
    const connectionHandler = serviceProvider.resolve<ConnectionHandler>('connectionHandler')
    return connectionHandler.disconnectDataSource(event, req)
  })

  IpcHandler.register('DATA_SOURCE_GET_FIELDS', async () => RedmineConnector.configFields)

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

  IpcHandler.register('LIST_TIME_ENTRIES', [ensureAuthenticated, injectConnector], (event, req) => {
    const timeEntriesHandler = serviceProvider.resolve<TimeEntriesHandler>('timeEntriesHandler')
    return timeEntriesHandler.listTimeEntries(event, req)
  })
  /* eslint-enable prettier/prettier */
}
