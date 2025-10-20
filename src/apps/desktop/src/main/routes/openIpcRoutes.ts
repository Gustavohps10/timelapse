import { IServiceProvider } from '@timelapse/container'
import RedmineConnector from '@timelapse/redmine-plugin'
import { app } from 'electron'

import { IpcHandler } from '@/main/adapters/IpcHandler'
import { handleDiscordLogin } from '@/main/auth/discord-handler'
import {
  ConnectionHandler,
  SessionHandler,
  TasksHandler,
  TimeEntriesHandler,
  TokenHandler,
} from '@/main/handlers'
import { AddonsHandler } from '@/main/handlers/AddonsHandler'
import { MetadataHandler } from '@/main/handlers/MetadataHandler'
import { WorkspacesHandler } from '@/main/handlers/WorkspacesHandler'
import { createAuthMiddleware } from '@/main/middlewares/ensureAuthenticated'
import { createInjectConnectorMiddleware } from '@/main/middlewares/injectConnector'

export function openIpcRoutes(serviceProvider: IServiceProvider): void {
  const ensureAuthenticated = createAuthMiddleware(serviceProvider)
  const injectConnector = createInjectConnectorMiddleware(serviceProvider)

  /* eslint-disable prettier/prettier */
  IpcHandler.register('SYSTEM_VERSION', () => {
    return Promise.resolve(app.getVersion())
  })

IpcHandler.register('METADATA_PULL', (event, req) => {
    const metadataHandler = serviceProvider.resolve<MetadataHandler>('metadataHandler')
    return metadataHandler.pull(event, req)
  })

  IpcHandler.register('TASKS_PULL', (event, req) => {
    const tasksHandler = serviceProvider.resolve<TasksHandler>('tasksHandler')
    return tasksHandler.pull(event, req)
  })
  
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

  IpcHandler.register('TIME_ENTRIES_PULL', [ensureAuthenticated, injectConnector], (event, req) => {
      const timeEntriesHandler = serviceProvider.resolve<TimeEntriesHandler>('timeEntriesHandler')
      return timeEntriesHandler.pull(event, req)
  })

  IpcHandler.register('TIME_ENTRIES_PUSH', [ensureAuthenticated, injectConnector], (event, req) => {
      const timeEntriesHandler = serviceProvider.resolve<TimeEntriesHandler>('timeEntriesHandler')
      return timeEntriesHandler.push(event, req)
  })

  IpcHandler.register('ADDONS_LIST', () => {
    const addonsHandler = serviceProvider.resolve<AddonsHandler>('addonsHandler')
    return addonsHandler.list()
  })

  IpcHandler.register('ADDONS_GETINSTALLED_BY_ID', (event, req) => {
    const addonsHandler = serviceProvider.resolve<AddonsHandler>('addonsHandler')
    return addonsHandler.getInstalledById(event, req)
  })

  IpcHandler.register('ADDONS_UPDATE_LOCAL', (event, req) => {
    const addonsHandler = serviceProvider.resolve<AddonsHandler>('addonsHandler')
    return addonsHandler.updateLocal(event, req)
  })

  IpcHandler.register('ADDONS_IMPORT', (event, req) => {
    const addonsHandler = serviceProvider.resolve<AddonsHandler>('addonsHandler')
    return addonsHandler.import(event, req)
  })

  IpcHandler.register('ADDONS_GET_INSTALLER', (event, req) => {
    const addonsHandler = serviceProvider.resolve<AddonsHandler>('addonsHandler')
    return addonsHandler.getInstaller(event, req)
  })

   IpcHandler.register('ADDONS_INSTALL', (event, req) => {
    const addonsHandler = serviceProvider.resolve<AddonsHandler>('addonsHandler')
    return addonsHandler.install(event, req)
  })

  /* eslint-enable prettier/prettier */
}
