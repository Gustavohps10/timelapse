import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { WorkspaceDTO } from '@/dtos'

export type CreateWorkspaceInput = {
  name: string
  pluginId: string
}

export interface ICreateWorkspaceUseCase {
  execute(input: CreateWorkspaceInput): Promise<Either<AppError, WorkspaceDTO>>
}
