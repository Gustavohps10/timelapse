import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { ITimeEntryQuery } from '@/contracts'
import { IListTimeEntriesUseCase } from '@/contracts/use-cases/IListTimeEntriesUseCase'
import { IUnitOfWork } from '@/contracts/workflow/IUnitOfWork'
import { TimeEntryDTO } from '@/dtos'

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
