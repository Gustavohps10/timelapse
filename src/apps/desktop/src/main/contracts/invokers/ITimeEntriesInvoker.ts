import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  PaginatedViewModel,
  TimeEntryViewModel,
} from '@trackalize/presentation/view-models'

export interface ITimeEntriesInvoker {
  findByMemberId: (
    payload: IRequest<{
      memberId: string
      startDate: Date
      endDate: Date
    }>,
  ) => Promise<PaginatedViewModel<TimeEntryViewModel[]>>
}
