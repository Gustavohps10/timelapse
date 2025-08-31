import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { PagedResultDTO, TimeEntryDTO } from '@/dtos'

export interface IListTimeEntriesUseCase {
  execute(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, PagedResultDTO<TimeEntryDTO>>>
}
