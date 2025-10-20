import {
  AppError,
  Either,
  InternalServerError,
} from '@timelapse/cross-cutting/helpers'

import { IMetadataQuery } from '@/contracts'
import {
  IMetadataPullUseCase,
  PullMetadataInput,
} from '@/contracts/use-cases/IMetadataPullUseCase'
import { MetadataDTO } from '@/dtos'

export class MetadataPullService implements IMetadataPullUseCase {
  constructor(private metadataQuery: IMetadataQuery) {}

  async execute(
    input: PullMetadataInput,
  ): Promise<Either<AppError, MetadataDTO>> {
    try {
      const metadata = await this.metadataQuery.getMetadata(
        input.checkpoint.id,
        input.checkpoint,
        input.batch,
      )
      return Either.success(metadata)
    } catch (error) {
      return Either.failure(
        InternalServerError.danger('Failed to pull metadata'),
      )
    }
  }
}
