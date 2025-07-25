import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  PaginatedViewModel,
  ViewModel,
  WorkspaceViewModel,
} from '@trackalize/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { IWorkspacesInvoker } from '@/main/contracts/invokers/IWorkspacesInvoker'
import { CreateWorkspaceRequest } from '@/main/handlers/WorkspacesHandler'

export const workspacesInvoker: IWorkspacesInvoker = {
  create: (
    request: IRequest<CreateWorkspaceRequest>,
  ): Promise<ViewModel<WorkspaceViewModel>> =>
    IpcInvoker.invoke<
      IRequest<CreateWorkspaceRequest>,
      ViewModel<WorkspaceViewModel>
    >('WORKSPACES_CREATE', request),

  listAll: (): Promise<PaginatedViewModel<WorkspaceViewModel[]>> =>
    IpcInvoker.invoke<never, PaginatedViewModel<WorkspaceViewModel[]>>(
      'WORKSPACES_GET_ALL',
    ),
}
