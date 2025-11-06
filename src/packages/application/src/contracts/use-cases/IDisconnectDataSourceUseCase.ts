import { AppError, Either } from '@timelapse/cross-cutting/helpers'

interface Input {
  workspaceId: string
}

export interface IDisconnectDataSourceUseCase {
  execute(input: Input): Promise<Either<AppError, void>>
}
