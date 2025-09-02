import { FieldGroup } from '@timelapse/connector-sdk'
import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  AuthenticationViewModel,
  PaginatedViewModel,
  ViewModel,
  WorkspaceViewModel,
} from '@timelapse/presentation/view-models'

export interface IWorkspacesInvoker {
  create(
    request: IRequest<{ name: string }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  listAll(): Promise<PaginatedViewModel<WorkspaceViewModel[]>>

  getDataSourceFields(): Promise<{
    credentials: FieldGroup[]
    configuration: FieldGroup[]
  }>

  getById(
    request: IRequest<{ workspaceId: string }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  linkDataSource(
    request: IRequest<{ workspaceId: string; dataSource: string }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  unlinkDataSource(
    request: IRequest<{ workspaceId: string }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  connectDataSource(
    request: IRequest<{
      workspaceId: string
      credentials: Record<string, unknown>
    }>,
  ): Promise<ViewModel<AuthenticationViewModel>>

  disconnectDataSource(
    request: IRequest<{ workspaceId: string }>,
  ): Promise<ViewModel<WorkspaceViewModel>>
}
