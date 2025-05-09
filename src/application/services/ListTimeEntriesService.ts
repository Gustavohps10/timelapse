import { ITimeEntryQuery } from '@/application/contracts/queries/ITimeEntryQuery'
import { TimeEntryDTO } from '@/application/dto/TimeEntryDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IListTimeEntriesUseCase } from '@/domain/use-cases/IListTimeEntriesUseCase'

export class ListTimeEntriesService implements IListTimeEntriesUseCase {
  public constructor(private readonly timeEntryQuery: ITimeEntryQuery) {}

  public async execute(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    return this.timeEntryQuery.findByMemberId(memberId, startDate, endDate)
  }
}
