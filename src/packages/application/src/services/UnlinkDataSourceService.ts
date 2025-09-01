import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import {
  IUnlinkDataSourceUseCase,
  IWorkspacesRepository,
  UnlinkDataSourceInput,
} from '@/contracts'
import { WorkspaceDTO } from '@/dtos'

export class UnlinkDataSourceService implements IUnlinkDataSourceUseCase {
  constructor(private readonly workspacesRepository: IWorkspacesRepository) {}

  public async execute(
    input: UnlinkDataSourceInput,
  ): Promise<Either<AppError, WorkspaceDTO>> {
    try {
      const workspace = await this.workspacesRepository.findById(
        input.workspaceId,
      )
      if (!workspace) {
        return Either.failure(new AppError('Workspace não encontrado'))
      }

      const result = workspace.unlinkDataSource()
      if (result.isFailure()) return result.forwardFailure()

      await this.workspacesRepository.update(workspace)

      const workspaceDTO: WorkspaceDTO = {
        id: workspace.id,
        name: workspace.name,
        dataSource: workspace.dataSource,
        dataSourceConfiguration: workspace.dataSourceConfiguration,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      }

      return Either.success(workspaceDTO)
    } catch (error) {
      return Either.failure(
        new AppError('ERRO_INESPERADO', (error as Error).message, 500),
      )
    }
  }
}
