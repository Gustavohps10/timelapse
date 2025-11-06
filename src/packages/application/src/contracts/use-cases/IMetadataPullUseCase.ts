import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { MetadataDTO } from '@/dtos/MetadataDTO'

export type PullMetadataInput = {
  checkpoint: { updatedAt: Date; id: string }
  batch: number
}

export interface IMetadataPullUseCase {
  execute(input: PullMetadataInput): Promise<Either<AppError, MetadataDTO>>
}
