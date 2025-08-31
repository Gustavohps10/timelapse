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

    const workspacesRepository = serviceProvider.resolve<IWorkspacesRepository>(
      'workspacesRepository',
    )
    const credentialsStorage =
      serviceProvider.resolve<ICredentialsStorage>('credentialsStorage')

    const workspace = await workspacesRepository.findById(workspaceId)

    const credentialsSerialized = await credentialsStorage.getToken(
      'trackalize',
      `workspace-session-${workspace!.id}`,
    )

    const credentialsJSON = credentialsSerialized
      ? JSON.parse(credentialsSerialized)
      : undefined

    const context = {
      config: workspace?.dataSourceConfiguration,
      credentials: credentialsJSON,
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
