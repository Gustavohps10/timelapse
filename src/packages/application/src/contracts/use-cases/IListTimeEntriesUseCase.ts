import { AppError, Either } from '@trackpoint/cross-cutting'

import { TimeEntryDTO } from '@/dto/TimeEntryDTO'

export interface IListTimeEntriesUseCase {
  execute(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>>
}
