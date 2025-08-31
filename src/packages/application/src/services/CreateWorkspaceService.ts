import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { Workspace } from '@trackalize/domain'

import {
  CreateWorkspaceInput,
  ICreateWorkspaceUseCase,
  IWorkspacesRepository,
} from '@/contracts'
import { WorkspaceDTO } from '@/dtos'

export class CreateWorkspaceService implements ICreateWorkspaceUseCase {
  constructor(private readonly workspacesRepository: IWorkspacesRepository) {}

  public async execute({
    name,
  }: CreateWorkspaceInput): Promise<Either<AppError, WorkspaceDTO>> {
    const workspace = Workspace.create(name)

    try {
      await this.workspacesRepository.create(workspace)
    } catch {
      return Either.failure(new AppError('ALGO DEU ERRADO AO CRIAR WORKSPACE'))
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
