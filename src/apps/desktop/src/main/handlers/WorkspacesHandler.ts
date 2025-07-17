import { ICreateWorkspaceUseCase } from '@trackalize/application'
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
  ) {}

  public async create(
    _event: IpcMainInvokeEvent,
    { body: input }: IRequest<CreateWorkspaceRequest>,
  ): Promise<ViewModel<WorkspaceViewModel>> {
    const result = await this.createWorkspaceService.execute(input)

    if (result.isFailure()) {
      return {
        isSuccess: false,
        statusCode: result.failure.statusCode || 500,
        error: result.failure.messageKey,
      }
    }

    return {
      isSuccess: true,
      statusCode: 201,
      data: result.success,
    }
  }
}
