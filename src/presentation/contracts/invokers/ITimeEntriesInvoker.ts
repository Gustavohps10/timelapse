import { IRequest } from '@/presentation/contracts/http'
import { ListTimeEntriesRequest } from '@/presentation/handlers/TimeEntriesHandler'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TimeEntryViewModel } from '@/presentation/view-models/TimeEntryViewModel'

export interface ITimeEntriesInvoker {
  findByMemberId: (
    payload: IRequest<ListTimeEntriesRequest>,
  ) => Promise<PaginatedViewModel<TimeEntryViewModel[]>>
}
