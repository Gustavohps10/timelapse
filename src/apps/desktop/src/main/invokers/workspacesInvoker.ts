import { IRequest } from '@trackalize/cross-cutting/transport'
import {
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
}
