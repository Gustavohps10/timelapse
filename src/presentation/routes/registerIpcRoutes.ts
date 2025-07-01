import { DependencyInjection } from '@Ioc/DependencyInjection'

import { IpcHandler } from '@/presentation/adapters/ipcHandler'
import { SessionHandler } from '@/presentation/handlers'
import { AuthHandler } from '@/presentation/handlers/AuthHandler'
import { TaskHandler } from '@/presentation/handlers/TaskHandler'
import { TimeEntriesHandler } from '@/presentation/handlers/TimeEntriesHandler'
import { TokenHandler } from '@/presentation/handlers/TokenHandler'
import { ensureAuthenticated } from '@/presentation/middlewares/ensureAuthenticated'

export function registerIpcRoutes(): void {
  /*
   * TOKEN
   */
  IpcHandler.register('SAVE_TOKEN', async (...args) => {
    const scoped = DependencyInjection.createOrGetScope()
    const handler = scoped.resolve<TokenHandler>('tokenHandler')
    return handler.saveToken(...args)
  })

  IpcHandler.register('GET_TOKEN', async (...args) => {
    const scoped = DependencyInjection.createOrGetScope()
    const handler = scoped.resolve<TokenHandler>('tokenHandler')
    return handler.getToken(...args)
  })

  IpcHandler.register('DELETE_TOKEN', async (...args) => {
    const scoped = DependencyInjection.createOrGetScope()
    const handler = scoped.resolve<TokenHandler>('tokenHandler')
    return handler.deleteToken(...args)
  })

  /*
   * Session
   */
  IpcHandler.register(
    'GET_CURRENT_USER',
    [ensureAuthenticated],
    async (...args) => {
      const scoped = DependencyInjection.createOrGetScope()
      const handler = scoped.resolve<SessionHandler>('sessionHandler')
      return handler.listTimeEntries(...args)
    },
  )

  /*
   * AUTH
   */
  IpcHandler.register('LOGIN', async (...args) => {
    const scoped = DependencyInjection.createOrGetScope()
    const handler = scoped.resolve<AuthHandler>('authHandler')
    return handler.login(...args)
  })

  /*
   * TASK
   */
  IpcHandler.register('TASKS_LIST', [ensureAuthenticated], async (...args) => {
    const scoped = DependencyInjection.createOrGetScope()
    const handler = scoped.resolve<TaskHandler>('taskHandler')
    return handler.listTasks(...args)
  })

  /*
   * TIME_ENTRIES
   */
  IpcHandler.register(
    'LIST_TIME_ENTRIES',
    [ensureAuthenticated],
    async (...args) => {
      const scoped = DependencyInjection.createOrGetScope()
      const handler = scoped.resolve<TimeEntriesHandler>('timeEntriesHandler')
      return handler.listTimeEntries(...args)
    },
  )
}
