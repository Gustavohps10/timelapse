import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { WorkspaceDTO } from '@/dtos'

export interface IListWorkspacesUseCase {
  execute(): Promise<Either<AppError, WorkspaceDTO[]>>
}
