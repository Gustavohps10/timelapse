import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { TimeEntryDTO } from '@/dtos'

export interface IListTimeEntriesUseCase {
  execute(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>>
}
