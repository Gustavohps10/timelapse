import { ListTimeEntriesRequest } from '@/presentation/handlers/TimeEntriesHandler'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TimeEntryViewModel } from '@/presentation/view-models/TimeEntryViewModel'

export interface ITimeEntries {
  findByMemberId: (
    payload: ListTimeEntriesRequest,
  ) => Promise<PaginatedViewModel<TimeEntryViewModel[]>>
}
