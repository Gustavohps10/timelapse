import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { IRequest } from '@/presentation/contracts/http'
import { ITimeEntriesInvoker } from '@/presentation/contracts/invokers/ITimeEntriesInvoker'
import { ListTimeEntriesRequest } from '@/presentation/handlers/TimeEntriesHandler'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TimeEntryViewModel } from '@/presentation/view-models/TimeEntryViewModel'

/* eslint-disable prettier/prettier */
export const timeEntriesInvoker: ITimeEntriesInvoker = {
  findByMemberId: (payload: IRequest<ListTimeEntriesRequest>): Promise<PaginatedViewModel<TimeEntryViewModel[]>> => IpcInvoker.invoke<IRequest<ListTimeEntriesRequest>, PaginatedViewModel<TimeEntryViewModel[]>>('LIST_TIME_ENTRIES', payload),
}
