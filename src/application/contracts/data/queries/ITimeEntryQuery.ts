import { IQueryBase } from '@/application/contracts/data/queries/IQueryBase'
import { TimeEntryDTO } from '@/application/dto/TimeEntryDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface ITimeEntryQuery extends IQueryBase<TimeEntryDTO> {
  findByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>>
}
