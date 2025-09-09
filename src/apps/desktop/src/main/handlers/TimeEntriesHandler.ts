import { IListTimeEntriesUseCase } from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  PaginatedViewModel,
  TimeEntryViewModel,
} from '@timelapse/presentation/view-models'

export interface ListTimeEntriesRequest {
  memberId: string
  startDate: Date
  endDate: Date
}

export class TimeEntriesHandler {
  constructor(
    private readonly listTimeEntriesService: IListTimeEntriesUseCase,
  ) {}

  public async listTimeEntries(
    _event: Electron.IpcMainInvokeEvent,
    {
      body: { memberId, startDate, endDate },
    }: IRequest<ListTimeEntriesRequest>,
  ): Promise<PaginatedViewModel<TimeEntryViewModel[]>> {
    const result = await this.listTimeEntriesService.execute(
      memberId,
      startDate,
      endDate,
    )
    if (result.isFailure()) {
      return {
        statusCode: 500,
        isSuccess: false,
        error: result.failure.messageKey,
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
      }
    }

    const timeEntries = result.success

    const timeEntriesViewModel = timeEntries.items
    return {
      statusCode: 200,
      isSuccess: true,
      data: timeEntriesViewModel,
      totalItems: timeEntries.total,
      totalPages: 1,
      currentPage: 1,
    }
  }
}
