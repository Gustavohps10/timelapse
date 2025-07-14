import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { IQueryBase } from '@/contracts/data/queries/IQueryBase'
import { TimeEntryDTO } from '@/dtos'

export interface ITimeEntryQuery extends IQueryBase<TimeEntryDTO> {
  findByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>>
}
