import { ITimeEntryQuery } from '@trackalize/connector-sdk/contracts'
import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { TimeEntryDTO } from '@trackalize/presentation/dtos'

import { IListTimeEntriesUseCase } from '@/contracts/use-cases/IListTimeEntriesUseCase'
import { IUnitOfWork } from '@/contracts/workflow/IUnitOfWork'

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
