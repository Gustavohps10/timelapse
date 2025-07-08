import { IListTimeEntriesUseCase } from '@trackpoint/application/contracts'
import { TimeEntryDTO } from '@trackpoint/application/dto'
import { AppError, Either } from '@trackpoint/cross-cutting/helpers'
import { IRequest } from '@trackpoint/cross-cutting/transport'
import {
  PaginatedViewModel,
  TimeEntryViewModel,
} from '@trackpoint/presentation/view-models'

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
    const result: Either<AppError, TimeEntryDTO[]> =
      await this.listTimeEntriesService.execute(memberId, startDate, endDate)

    if (result.isFailure()) {
      return {
        statusCode: 500,
        isSuccess: false,
        error: 'Erro ao listar tarefas',
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
      }
    }

    const timeEntries: TimeEntryViewModel[] = result.success

    return {
      statusCode: 200,
      isSuccess: true,
      data: timeEntries,
      totalItems: timeEntries.length,
      totalPages: 1,
      currentPage: 1,
    }
  }
}
