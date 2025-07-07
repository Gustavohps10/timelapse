import { IRequest } from '@trackpoint/cross-cutting/transport'
import {
  PaginatedViewModel,
  TimeEntryViewModel,
} from '@trackpoint/presentation/view-models'

export interface ITimeEntriesInvoker {
  findByMemberId: (
    payload: IRequest<{
      memberId: string
      startDate: Date
      endDate: Date
    }>,
  ) => Promise<PaginatedViewModel<TimeEntryViewModel[]>>
}
