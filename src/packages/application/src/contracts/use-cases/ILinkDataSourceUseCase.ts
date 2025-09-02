import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { WorkspaceDTO } from '@/dtos'

export type LinkDataSourceInput = {
  workspaceId: string
  dataSource: string
}

export interface ILinkDataSourceUseCase {
  execute(input: LinkDataSourceInput): Promise<Either<AppError, WorkspaceDTO>>
}
