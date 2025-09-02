import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { IWorkspacesQuery } from '@/contracts/data/queries'
import { IListWorkspacesUseCase } from '@/contracts/use-cases/IListWorkspacesUseCase'
import { PagedResultDTO, WorkspaceDTO } from '@/dtos'

export class ListWorkspacesService implements IListWorkspacesUseCase {
  constructor(private readonly workspacesQuery: IWorkspacesQuery) {}

  public async execute(): Promise<
    Either<AppError, PagedResultDTO<WorkspaceDTO>>
  > {
    try {
      const workspaces = await this.workspacesQuery.findAll()
      return Either.success(workspaces)
    } catch (error) {
      return Either.failure(
        new AppError('ERRO_INESPERADO', (error as Error).message, 500),
      )
    }
  }
}
