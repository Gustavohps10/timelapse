import { DependencyInjection } from '@Ioc/DependencyInjection'

import { IpcHandler } from '@/presentation/adapters/ipcHandler'
import { AuthHandler } from '@/presentation/handlers/AuthHandler'
import { TaskHandler } from '@/presentation/handlers/TaskHandler'
import { TimeEntriesHandler } from '@/presentation/handlers/TimeEntriesHandler'
import { TokenHandler } from '@/presentation/handlers/TokenHandler'
import { ensureAuthenticatedMiddleware } from '@/presentation/middlewares/ensureAuthenticatedMiddleware'

export function registerIpcRoutes(): void {
  const tokenHandler = DependencyInjection.get<TokenHandler>('tokenHandler')
  const authHandler = DependencyInjection.get<AuthHandler>('authHandler')
  const taskHandler = DependencyInjection.get<TaskHandler>('taskHandler')
  const timeEntriesHandler =
    DependencyInjection.get<TimeEntriesHandler>('timeEntriesHandler')

  /*
  TOKEN
  */
  IpcHandler.handle('SAVE_TOKEN', tokenHandler.saveToken.bind(tokenHandler))
  IpcHandler.handle('GET_TOKEN', tokenHandler.getToken.bind(tokenHandler))
  IpcHandler.handle('DELETE_TOKEN', tokenHandler.deleteToken.bind(tokenHandler))

  /*
  AUTH
  */
  IpcHandler.handle('LOGIN', authHandler.login.bind(authHandler))

  /*
  TASK
  */
  IpcHandler.register(
    'TASKS_LIST',
    [ensureAuthenticatedMiddleware],
    taskHandler.listTasks.bind(taskHandler),
  )

  /*
  TIME_ENTRIES
  */
  IpcHandler.register(
    'LIST_TIME_ENTRIES',
    [ensureAuthenticatedMiddleware],
    timeEntriesHandler.listTimeEntries.bind(timeEntriesHandler),
  )
}
