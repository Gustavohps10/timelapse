import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { FileData } from '@/contracts/infra'

export interface IImportAddonUseCase {
  execute(fileData: FileData): Promise<Either<AppError, void>>
}
