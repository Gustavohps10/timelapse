import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { WorkspaceDTO } from '@/dtos'

export interface GetWorkspaceInput {
  workspaceId: string
}

export interface IGetWorkspaceUseCase {
  execute(input: GetWorkspaceInput): Promise<Either<AppError, WorkspaceDTO>>
}
