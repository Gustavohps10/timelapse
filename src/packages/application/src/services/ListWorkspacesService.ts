import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { IWorkspacesRepository } from '@/contracts'
import { IListWorkspacesUseCase } from '@/contracts/use-cases/IListWorkspacesUseCase'
import { WorkspaceDTO } from '@/dtos'

export class ListWorkspacesService implements IListWorkspacesUseCase {
  constructor(private readonly workspacesRepository: IWorkspacesRepository) {}

  public async execute(): Promise<Either<AppError, WorkspaceDTO[]>> {
    const result = await this.workspacesRepository.findAll()
    if (result.isFailure()) return result.forwardFailure()

    const workspaces: WorkspaceDTO[] = result.success
    return Either.success(
      workspaces.map(
        (workspace): WorkspaceDTO => ({
          id: workspace.id,
          name: workspace.name,
          dataSourceType: workspace.dataSourceType,
          pluginId: workspace.pluginId,
          pluginConfig: workspace.pluginConfig,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        }),
      ),
    )
  }
}
