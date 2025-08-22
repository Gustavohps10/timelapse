import {
  ICredentialsStorage,
  IWorkspacesRepository,
} from '@trackalize/application'
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

export function openIpcRoutes(serviceProvider: IServiceProvider): void {
  const ensureAuthenticated = createAuthMiddleware(serviceProvider)

  /*
   * WORKSPACE
   */

  IpcHandler.register('WORKSPACES_CREATE', async (...args) => {
    const handler =
      serviceProvider.resolve<WorkspacesHandler>('workspacesHandler')
    return handler.create(...args)
  })

  IpcHandler.register('WORKSPACES_GET_ALL', async () => {
    const handler =
      serviceProvider.resolve<WorkspacesHandler>('workspacesHandler')
    return handler.listAll()
  })

  IpcHandler.register('PLUGIN_GET_FIELDS', async (...args) => {
    // futuramente obter o modulo index.js com base no nome da PASTA,
    // exemplo: C:/meuapp/plugins/<@trackalize/redmine-plugin>/index.js
    const connector = RedmineConnector
    return connector.configFields
  })

  /*
   * DISCORD
   */

  IpcHandler.register('DISCORD_LOGIN', handleDiscordLogin)

  /*
   * TOKENs and SECRET KEYS
   */
  IpcHandler.register('SAVE_TOKEN', async (...args) => {
    const handler = serviceProvider.resolve<TokenHandler>('tokenHandler')
    return handler.saveToken(...args)
  })

  IpcHandler.register('GET_TOKEN', async (...args) => {
    const handler = serviceProvider.resolve<TokenHandler>('tokenHandler')
    return handler.getToken(...args)
  })

  IpcHandler.register('DELETE_TOKEN', async (...args) => {
    const handler = serviceProvider.resolve<TokenHandler>('tokenHandler')
    return handler.deleteToken(...args)
  })

  /*
   * Session
   */
  IpcHandler.register(
    'GET_CURRENT_USER',
    [ensureAuthenticated],
    async (event, args) => {
      const { workspaceId } = args.body
      const scoped = await configureConnector(serviceProvider, workspaceId)

      const handler = scoped.resolve<SessionHandler>('sessionHandler')
      return handler.listTimeEntries(event, args)
    },
  )

  /*
   * AUTH
   */
  IpcHandler.register('LOGIN', async (event, args) => {
    const { workspaceId } = args.body

    const scoped = await configureConnector(serviceProvider, workspaceId)
    const handler = scoped.resolve<AuthHandler>('authHandler')
    return handler.login(event, args)
  })

  /*
   * TASK
   */
  IpcHandler.register('LIST_TIME_ENTRIES', async (event, args) => {
    const { workspaceId } = args.body

    const scoped = await configureConnector(serviceProvider, workspaceId)

    const handler = scoped.resolve<TimeEntriesHandler>('timeEntriesHandler')
    return handler.listTimeEntries(event, args)
  })
}

export async function configureConnector(
  provider: IServiceProvider,
  workspaceId: string,
): Promise<IServiceProvider> {
  const workspacesRepo = provider.resolve<IWorkspacesRepository>(
    'workspacesRepository',
  )
  const credentialsStorage =
    provider.resolve<ICredentialsStorage>('credentialsStorage')

  const result = await workspacesRepo.findById(workspaceId)
  if (result.isFailure()) {
    throw new Error(`Workspace ${workspaceId} não encontrado`)
  }

  const { success: workspace } = result

  const credentials = (await credentialsStorage.getToken(
    'trackalize',
    `workspace-session-${workspace!.id}`,
  )) as string

  const context = {
    config: workspace?.pluginConfig,
    credentials: JSON.parse(credentials),
  }

  const connectorDeps = {
    authenticationStrategy: RedmineConnector.getAuthenticationStrategy(context),
    taskQuery: RedmineConnector.getTaskQuery(context),
    memberQuery: RedmineConnector.getMemberQuery(context),
    timeEntryQuery: RedmineConnector.getTimeEntryQuery(context),
    taskMutation: RedmineConnector.getTaskMutation(context),
  }

  return provider.withConnector(connectorDeps)
}
