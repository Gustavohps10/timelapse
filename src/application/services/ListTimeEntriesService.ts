import { ITimeEntryQuery } from '@/application/contracts/data/queries/ITimeEntryQuery'
import { IUnitOfWork } from '@/application/contracts/workflow/IUnitOfWork'
import { TimeEntryDTO } from '@/application/dto/TimeEntryDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IListTimeEntriesUseCase } from '@/domain/use-cases/IListTimeEntriesUseCase'

export class ListTimeEntriesService implements IListTimeEntriesUseCase {
  private readonly timeEntryQuery: ITimeEntryQuery

  public constructor(unitOfWork: IUnitOfWork) {
    this.timeEntryQuery = unitOfWork.timeEntryQuery
  }

  public async execute(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    return this.timeEntryQuery.findByMemberId(memberId, startDate, endDate)
  }
}
