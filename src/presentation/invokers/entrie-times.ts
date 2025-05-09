import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { ListTimeEntriesRequest } from '@/presentation/handlers/TimeEntriesHandler'
import { ITimeEntries } from '@/presentation/interfaces/ITimeEntries'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TimeEntryViewModel } from '@/presentation/view-models/TimeEntryViewModel'

/* eslint-disable prettier/prettier */
export const timeEntries: ITimeEntries = {
  findByMemberId: (payload: ListTimeEntriesRequest): Promise<PaginatedViewModel<TimeEntryViewModel[]>> => IpcInvoker.invoke<ListTimeEntriesRequest, PaginatedViewModel<TimeEntryViewModel[]>>('LIST_TIME_ENTRIES', payload),
}
