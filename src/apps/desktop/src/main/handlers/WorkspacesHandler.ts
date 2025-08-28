import {
  ICreateWorkspaceUseCase,
  IListWorkspacesUseCase,
} from '@trackalize/application'
import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  ViewModel,
  WorkspaceViewModel,
} from '@trackalize/presentation/view-models'
import { IpcMainInvokeEvent } from 'electron'

export interface CreateWorkspaceRequest {
  name: string
}

export class WorkspacesHandler {
  constructor(
    private readonly createWorkspaceService: ICreateWorkspaceUseCase,
    private readonly listWorkspacesService: IListWorkspacesUseCase,
  ) {}

  public async create(
    _event: IpcMainInvokeEvent,
    { body: { name } }: IRequest<CreateWorkspaceRequest>,
  ): Promise<ViewModel<WorkspaceViewModel>> {
    const result = await this.createWorkspaceService.execute({
      name,
    })

    if (result.isFailure()) {
      return {
        isSuccess: false,
        statusCode: result.failure.statusCode || 500,
        error: result.failure.messageKey,
      }
    }

    const newWorkspace = result.success
    return {
      isSuccess: true,
      statusCode: 201,
      data: {
        id: newWorkspace.id,
        name: newWorkspace.name,
        dataSourceType: newWorkspace.dataSourceType,
        pluginId: newWorkspace.pluginId,
        pluginConfig: newWorkspace.pluginConfig,
        createdAt: newWorkspace.createdAt,
        updatedAt: newWorkspace.updatedAt,
      },
    }
  }

  public async listAll(): Promise<{
    statusCode: number
    isSuccess: boolean
    data: WorkspaceViewModel[]
    error?: string
    totalItems: number
    totalPages: number
    currentPage: number
  }> {
    const result = await this.listWorkspacesService.execute()

    if (result.isFailure()) {
      return {
        statusCode: 500,
        isSuccess: false,
        error: 'Erro ao listar workspaces',
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
      }
    }

    const workspaces = result.success

    const viewModels: WorkspaceViewModel[] = workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      dataSourceType: w.dataSourceType,
      pluginId: w.pluginId,
      pluginConfig: w.pluginConfig,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }))

    return {
      statusCode: 200,
      isSuccess: true,
      data: viewModels,
      totalItems: viewModels.length,
      totalPages: 1,
      currentPage: 1,
    }
  }
}
