import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { WorkspaceDTO } from '@/dtos'

export type UnlinkDataSourceInput = {
  workspaceId: string
}

export interface IUnlinkDataSourceUseCase {
  execute(input: UnlinkDataSourceInput): Promise<Either<AppError, WorkspaceDTO>>
}
