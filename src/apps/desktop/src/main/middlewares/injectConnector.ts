import {
  ICredentialsStorage,
  IWorkspacesRepository,
} from '@trackalize/application'
import { IServiceProvider } from '@trackalize/container'
import { IRequest } from '@trackalize/cross-cutting/transport'
import RedmineConnector from '@trackalize/redmine-plugin'
import { IpcMainInvokeEvent } from 'electron'

export function createInjectConnectorMiddleware(
  serviceProvider: IServiceProvider,
) {
  return async (
    event: IpcMainInvokeEvent,
    req: IRequest<any>,
    next: () => Promise<any>,
  ) => {
    const { workspaceId } = req.body
    if (!workspaceId) throw new Error('workspaceId não informado')

    const workspacesRepo = serviceProvider.resolve<IWorkspacesRepository>(
      'workspacesRepository',
    )
    const credentialsStorage =
      serviceProvider.resolve<ICredentialsStorage>('credentialsStorage')

    const result = await workspacesRepo.findById(workspaceId)
    if (result.isFailure())
      throw new Error(`Workspace ${workspaceId} não encontrado`)

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
      authenticationStrategy:
        RedmineConnector.getAuthenticationStrategy(context),
      taskQuery: RedmineConnector.getTaskQuery(context),
      memberQuery: RedmineConnector.getMemberQuery(context),
      timeEntryQuery: RedmineConnector.getTimeEntryQuery(context),
      taskRepository: RedmineConnector.getTaskRepository(context),
    }

    serviceProvider.include(connectorDeps)

    return next()
  }
}
