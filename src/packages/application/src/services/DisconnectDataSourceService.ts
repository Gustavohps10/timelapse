import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import {
  IDisconnectDataSourceUseCase,
  IWorkspacesRepository,
} from '@/contracts'

interface Input {
  workspaceId: string
}

export class DisconnectDataSourceService
  implements IDisconnectDataSourceUseCase
{
  constructor(private readonly workspacesRepository: IWorkspacesRepository) {}

  public async execute(input: Input): Promise<Either<AppError, void>> {
    const workspace = await this.workspacesRepository.findById(
      input.workspaceId,
    )
    if (!workspace) {
      return Either.failure(new AppError('Workspace não encontrado'))
    }

    const result = workspace.disconnectDataSource()
    if (result.isFailure()) return result.forwardFailure()

    await this.workspacesRepository.update(workspace)
    return Either.success(undefined)
  }
}
