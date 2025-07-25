import { AwilixContainer } from 'awilix'

import { IpcHandler } from '@/main/adapters/IpcHandler'
import { handleDiscordLogin } from '@/main/auth/discord-handler'
import {
  AuthHandler,
  SessionHandler,
  TaskHandler,
  TimeEntriesHandler,
  TokenHandler,
} from '@/main/handlers'
import { WorkspacesHandler } from '@/main/handlers/WorkspacesHandler'
import { createAuthMiddleware } from '@/main/middlewares/ensureAuthenticated'

export function openIpcRoutes(container: AwilixContainer): void {
  const ensureAuthenticated = createAuthMiddleware(container)

  /*
   * WORKSPACE
   */

  IpcHandler.register('WORKSPACES_CREATE', async (...args) => {
    const handler = container.resolve<WorkspacesHandler>('workspacesHandler')
    return handler.create(...args)
  })

  IpcHandler.register('WORKSPACES_GET_ALL', async () => {
    const handler = container.resolve<WorkspacesHandler>('workspacesHandler')
    return handler.listAll()
  })

  /*
   * DISCORD
   */

  IpcHandler.register('DISCORD_LOGIN', handleDiscordLogin)

  /*
   * TOKENs and SECRET KEYS
   */
  IpcHandler.register('SAVE_TOKEN', async (...args) => {
    const handler = container.resolve<TokenHandler>('tokenHandler')
    return handler.saveToken(...args)
  })

  IpcHandler.register('GET_TOKEN', async (...args) => {
    const handler = container.resolve<TokenHandler>('tokenHandler')
    return handler.getToken(...args)
  })

  IpcHandler.register('DELETE_TOKEN', async (...args) => {
    const handler = container.resolve<TokenHandler>('tokenHandler')
    return handler.deleteToken(...args)
  })

  /*
   * Session
   */
  IpcHandler.register(
    'GET_CURRENT_USER',
    [ensureAuthenticated],
    async (...args) => {
      const handler = container.resolve<SessionHandler>('sessionHandler')
      return handler.listTimeEntries(...args)
    },
  )

  /*
   * AUTH
   */
  IpcHandler.register('LOGIN', async (...args) => {
    const handler = container.resolve<AuthHandler>('authHandler')
    return handler.login(...args)
  })

  /*
   * TASK
   */
  IpcHandler.register('TASKS_LIST', [ensureAuthenticated], async (...args) => {
    const handler = container.resolve<TaskHandler>('taskHandler')
    return handler.listTasks(...args)
  })

  /*
   * TIME_ENTRIES
   */
  IpcHandler.register(
    'LIST_TIME_ENTRIES',
    [ensureAuthenticated],
    async (...args) => {
      const handler =
        container.resolve<TimeEntriesHandler>('timeEntriesHandler')
      return handler.listTimeEntries(...args)
    },
  )
}
