import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { Workspace } from '@trackalize/domain'
import { randomUUID } from 'crypto'

import {
  CreateWorkspaceInput,
  ICreateWorkspaceUseCase,
  IUnitOfWork,
} from '@/contracts'
import { WorkspaceDTO } from '@/dtos'

export class CreateWorkspaceService implements ICreateWorkspaceUseCase {
  constructor(private readonly unitOfWork: IUnitOfWork) {}

  public async execute({
    name,
    pluginConfig,
    pluginId,
  }: CreateWorkspaceInput): Promise<Either<AppError, WorkspaceDTO>> {
    const workspace = new Workspace(
      `ws-${randomUUID()}`,
      name,
      'local',
      new Date(),
      new Date(),
      pluginId,
      pluginConfig,
    )

    const newWorkspace =
      await this.unitOfWork.workspacesRepository.create(workspace)

    if (!newWorkspace)
      return Either.failure(new AppError('ALGO DEU ERRADO AO CRIAR WORKSPACE'))

    const workspaceDTO: WorkspaceDTO = {
      id: workspace.id,
      name: workspace.name,
      dataSourceType: workspace.dataSourceType,
      pluginId: workspace.pluginId,
      config: workspace.config,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    }

    return Either.success(workspaceDTO)
  }
}
