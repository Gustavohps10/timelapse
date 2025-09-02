import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { IWorkspacesRepository } from '@/contracts'
import {
  ILinkDataSourceUseCase,
  LinkDataSourceInput,
} from '@/contracts/use-cases/ILinkDataSourceUseCase'
import { WorkspaceDTO } from '@/dtos'

export class LinkDataSourceService implements ILinkDataSourceUseCase {
  constructor(private readonly workspacesRepository: IWorkspacesRepository) {}

  public async execute(
    input: LinkDataSourceInput,
  ): Promise<Either<AppError, WorkspaceDTO>> {
    try {
      const workspace = await this.workspacesRepository.findById(
        input.workspaceId,
      )

      if (workspace == null)
        return Either.failure(new AppError('WORKSPACE_NAO_ENCONTRADO', '', 404))

      workspace.linkDataSource(input.dataSource)

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
