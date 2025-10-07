import {
  IListTimeEntriesUseCase,
  ITimeEntriesPullUseCase,
  ITimeEntriesPushUseCase,
  PushTimeEntriesInput,
} from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import {
  PaginatedViewModel,
  SyncDocumentViewModel,
  TimeEntryViewModel,
} from '@timelapse/presentation/view-models'

export interface ListTimeEntriesRequest {
  memberId: string
  startDate: Date
  endDate: Date
}

export interface PullTimeEntriesRequest {
  checkpoint: { updatedAt: Date; id: string }
  batch: number
}

export class TimeEntriesHandler {
  constructor(
    private readonly listTimeEntriesService: IListTimeEntriesUseCase,
    private readonly timeEntriesPullService: ITimeEntriesPullUseCase,
    private readonly timeEntriesPushService: ITimeEntriesPushUseCase,
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

    return {
      statusCode: 200,
      isSuccess: true,
      data: timeEntries.items,
      totalItems: timeEntries.total,
      totalPages: 1,
      currentPage: 1,
    }
  }

  public async pull(
    _event: Electron.IpcMainInvokeEvent,
    { body }: IRequest<PullTimeEntriesRequest>,
  ): Promise<PaginatedViewModel<TimeEntryViewModel[]>> {
    const result = await this.timeEntriesPullService.execute({
      checkpoint: body.checkpoint,
      batch: body.batch,
    })

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

    const dtos = result.success
    const viewModels: TimeEntryViewModel[] = dtos.map((dto) => ({
      id: dto.id,
      task: dto.task,
      user: dto.user,
      activity: dto.activity,
      startDate: dto.startDate,
      endDate: dto.endDate,
      timeSpent: dto.timeSpent,
      comments: dto.comments,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }))

    return {
      statusCode: 200,
      isSuccess: true,
      data: viewModels,
      totalItems: dtos.length,
      totalPages: 1,
      currentPage: 1,
    }
  }

  public async push(
    _event: Electron.IpcMainInvokeEvent,
    { body }: IRequest<PushTimeEntriesInput>,
  ): Promise<PaginatedViewModel<SyncDocumentViewModel<TimeEntryViewModel>[]>> {
    const result = await this.timeEntriesPushService.execute(body)

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

    const viewModels: SyncDocumentViewModel<TimeEntryViewModel>[] =
      result.success.map((dto) => ({
        document: dto.document,
        _deleted: dto._deleted,
        _conflicted: dto._conflicted,
        _conflictData: dto._conflictData,
        _validationError: dto._validationError && {
          messageKey: dto._validationError.messageKey,
          details: dto._validationError.details,
          statusCode: dto._validationError.statusCode,
          type: dto._validationError.type,
        },
        _syncedAt: dto._syncedAt,
        assumedMasterState: dto.assumedMasterState,
      }))

    return {
      statusCode: 200,
      isSuccess: true,
      data: viewModels,
      totalItems: viewModels.length,
      totalPages: 1,
      currentPage: 1,
    }
  }
}
