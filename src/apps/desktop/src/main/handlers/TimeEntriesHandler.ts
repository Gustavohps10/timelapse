export interface ListTimeEntriesRequest {
  memberId: string
  startDate: Date
  endDate: Date
}
import {
  IListTimeEntriesUseCase,
  ITimeEntriesPullUseCase,
} from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  PaginatedViewModel,
  TimeEntryViewModel,
} from '@timelapse/presentation/view-models'

export interface PullTimeEntriesRequest {
  checkpoint: { updatedAt: Date; id: string }
  batch: number
}

export class TimeEntriesHandler {
  constructor(
    private readonly listTimeEntriesService: IListTimeEntriesUseCase,
    private readonly timeEntriesPullService: ITimeEntriesPullUseCase,
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

  public async pull(
    _event: Electron.IpcMainInvokeEvent,
    { body }: IRequest<PullTimeEntriesRequest>,
  ): Promise<TimeEntryViewModel[]> {
    const { checkpoint, batch } = body

    const result = await this.timeEntriesPullService.execute({
      checkpoint,
      batch,
    })
    if (result.isFailure()) {
      return []
    }

    return result.success.map((entry) => ({
      id: entry.id,
      taskId: entry.taskId,
      project: entry.project,
      issue: entry.issue,
      user: entry.user,
      activity: entry.activity,
      hours: entry.hours,
      comments: entry.comments,
      spentOn: entry.spentOn,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }))
  }
}
