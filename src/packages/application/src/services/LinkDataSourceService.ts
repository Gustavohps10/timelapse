import { AppError, Either } from '@trackalize/cross-cutting/helpers'

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
    const findResult = await this.workspacesRepository.findById(
      input.workspaceId,
    )

    if (findResult.isFailure()) {
      return findResult.forwardFailure()
    }

    const workspaceDTO = findResult.success

    if (workspaceDTO == null)
      return Either.failure(new AppError('WORKSPACE_NAO_ENCONTRADO', '', 404))

    const updatePayload: Partial<WorkspaceDTO> = {
      dataSourceType: input.dataSource,
      pluginConfig: undefined,
    }

    const workspaceEntity = await this.workspacesRepository.update(
      workspaceDTO.id,
      updatePayload,
    )

    if (workspaceEntity == null) {
      return Either.failure(
        new AppError('NAO_FOI_POSSIVEL_ATUALIZAR_WORKSPACE', '', 422),
      )
    }

    return Either.success(workspaceDTO)
  }
}
