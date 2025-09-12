import { ITimeEntriesClient } from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  PaginatedViewModel,
  TimeEntryViewModel,
} from '@timelapse/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { ListTimeEntriesRequest } from '@/main/handlers'

/* eslint-disable prettier/prettier */
export const timeEntriesInvoker: ITimeEntriesClient = {
  findByMemberId: (payload: IRequest<ListTimeEntriesRequest>): Promise<PaginatedViewModel<TimeEntryViewModel[]>> => IpcInvoker.invoke<IRequest<ListTimeEntriesRequest>, PaginatedViewModel<TimeEntryViewModel[]>>('LIST_TIME_ENTRIES', payload),
}
