import { FieldGroup } from '@trackalize/connector-sdk'
import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  PaginatedViewModel,
  ViewModel,
  WorkspaceViewModel,
} from '@trackalize/presentation/view-models'

export interface CreateWorkspaceRequest {
  name: string
  pluginId?: string
  pluginConfig?: Record<string, unknown>
}

export interface IWorkspacesInvoker {
  create(
    request: IRequest<CreateWorkspaceRequest>,
  ): Promise<ViewModel<WorkspaceViewModel>>
  listAll(): Promise<PaginatedViewModel<WorkspaceViewModel[]>>
  getPluginFields(): Promise<FieldGroup[]>
}
