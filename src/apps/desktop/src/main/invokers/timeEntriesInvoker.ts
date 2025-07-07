import { IRequest } from '@trackpoint/cross-cutting/transport'
import {
  PaginatedViewModel,
  TimeEntryViewModel,
} from '@trackpoint/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { ITimeEntriesInvoker } from '@/main/contracts/invokers/ITimeEntriesInvoker'
import { ListTimeEntriesRequest } from '@/main/handlers'

/* eslint-disable prettier/prettier */
export const timeEntriesInvoker: ITimeEntriesInvoker = {
  findByMemberId: (payload: IRequest<ListTimeEntriesRequest>): Promise<PaginatedViewModel<TimeEntryViewModel[]>> => IpcInvoker.invoke<IRequest<ListTimeEntriesRequest>, PaginatedViewModel<TimeEntryViewModel[]>>('LIST_TIME_ENTRIES', payload),
}
