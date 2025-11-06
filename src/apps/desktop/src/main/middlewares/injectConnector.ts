import Redmine4Test from '@timelapse/addon-for-tests'
import {
  ICredentialsStorage,
  IServiceProvider,
  IWorkspacesRepository,
} from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import { IpcMainInvokeEvent } from 'electron'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'

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
      'timelapse',
      `workspace-session-${workspace!.id}`,
    )
    const credentialsJSON = credentialsSerialized
      ? JSON.parse(credentialsSerialized)
      : undefined

    const context = {
      config: workspace?.dataSourceConfiguration, // se ainda precisar alguma config
      credentials: credentialsJSON,
    }

    // caminho do addon baseado no workspace.dataSource
    const addonPath = resolve(
      `./addons/datasource/${workspace?.dataSource}/index.js`,
    )
    if (!existsSync(addonPath))
      throw new Error(`Datasource não encontrado em ${addonPath}`)

    const addonURL = pathToFileURL(addonPath).href
    const datasourceModule = await import(addonURL)
    // const connector = datasourceModule.default
    const connector = Redmine4Test

    const connectorDeps = {
      authenticationStrategy: connector.getAuthenticationStrategy(context),
      memberQuery: connector.getMemberQuery(context),
      timeEntryQuery: connector.getTimeEntryQuery(context),
      timeEntryRepository: connector.getTimeEntryRepository(context),
      taskQuery: connector.getTaskQuery(context),
      taskRepository: connector.getTaskRepository(context),
      metadataQuery: connector.getMetadataQuery(context),
    }

    serviceProvider.include(connectorDeps)

    return next()
  }
}
