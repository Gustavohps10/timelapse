import {
  ITimeEntriesClient,
  PushTimeEntriesInput,
} from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  PaginatedViewModel,
  SyncDocumentViewModel,
  TimeEntryViewModel,
} from '@timelapse/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { ListTimeEntriesRequest, PullTimeEntriesRequest } from '@/main/handlers'

export const timeEntriesInvoker: ITimeEntriesClient = {
  findByMemberId: (
    payload: IRequest<ListTimeEntriesRequest>,
  ): Promise<PaginatedViewModel<TimeEntryViewModel[]>> =>
    IpcInvoker.invoke<
      IRequest<ListTimeEntriesRequest>,
      PaginatedViewModel<TimeEntryViewModel[]>
    >('LIST_TIME_ENTRIES', payload),

  pull: (
    payload: IRequest<PullTimeEntriesRequest>,
  ): Promise<TimeEntryViewModel[]> =>
    IpcInvoker.invoke<IRequest<PullTimeEntriesRequest>, TimeEntryViewModel[]>(
      'TIME_ENTRIES_PULL',
      payload,
    ),

  push: (
    payload: IRequest<PushTimeEntriesInput>,
  ): Promise<PaginatedViewModel<SyncDocumentViewModel<TimeEntryViewModel>[]>> =>
    IpcInvoker.invoke<
      IRequest<PushTimeEntriesInput>,
      PaginatedViewModel<SyncDocumentViewModel<TimeEntryViewModel>[]>
    >('TIME_ENTRIES_PUSH', payload),
}
