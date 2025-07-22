import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  ViewModel,
  WorkspaceViewModel,
} from '@trackalize/presentation/view-models'

export interface CreateWorkspaceRequest {
  name: string
  pluginId: string
}

export interface IWorkspacesInvoker {
  create(
    request: IRequest<CreateWorkspaceRequest>,
  ): Promise<ViewModel<WorkspaceViewModel>>
}
