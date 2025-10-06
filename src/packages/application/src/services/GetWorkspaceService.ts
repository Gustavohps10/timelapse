import {
  AppError,
  Either,
  NotFoundError,
} from '@timelapse/cross-cutting/helpers'

import { IWorkspacesRepository } from '@/contracts'
import {
  GetWorkspaceInput,
  IGetWorkspaceUseCase,
} from '@/contracts/use-cases/IGetWorkspaceUseCase'
import { WorkspaceDTO } from '@/dtos'

export class GetWorkspaceService implements IGetWorkspaceUseCase {
  constructor(private readonly workspacesRepository: IWorkspacesRepository) {}

  public async execute(
    input: GetWorkspaceInput,
  ): Promise<Either<AppError, WorkspaceDTO>> {
    const workspace = await this.workspacesRepository.findById(
      input.workspaceId,
    )

    if (!workspace) {
      return Either.failure(NotFoundError.danger('Workspace não encontrado.'))
    }

    const workspaceDTO: WorkspaceDTO = {
      id: workspace.id,
      name: workspace.name,
      dataSource: workspace.dataSource,
      dataSourceConfiguration: workspace.dataSourceConfiguration,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    }

    return Either.success(workspaceDTO)
  }
}
