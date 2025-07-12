import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { TimeEntryDTO } from '@trackalize/presentation/dtos'

import { IQueryBase } from '@/contracts/data/queries/IQueryBase'

export interface ITimeEntryQuery extends IQueryBase<TimeEntryDTO> {
  findByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>>
}
