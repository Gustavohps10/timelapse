import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  PaginatedViewModel,
  TimeEntryViewModel,
} from '@timelapse/presentation/view-models'

export interface ITimeEntriesInvoker {
  findByMemberId: (
    payload: IRequest<{
      memberId: string
      startDate: Date
      endDate: Date
    }>,
  ) => Promise<PaginatedViewModel<TimeEntryViewModel[]>>
}
