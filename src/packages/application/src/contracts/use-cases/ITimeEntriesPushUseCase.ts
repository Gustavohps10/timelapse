import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { SyncDocumentDTO, TimeEntryDTO } from '@/dtos'

export type SyncTimeEntryDTO = SyncDocumentDTO<TimeEntryDTO>

export type PushTimeEntriesInput = {
  entries: SyncTimeEntryDTO[]
}

export interface ITimeEntriesPushUseCase {
  execute(
    input: PushTimeEntriesInput,
  ): Promise<Either<AppError, SyncTimeEntryDTO[]>>
}
