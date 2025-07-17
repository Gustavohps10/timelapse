import { IListTimeEntriesUseCase } from '@trackalize/application'
import { TimeEntryDTO } from '@trackalize/application'
import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  PaginatedViewModel,
  TimeEntryViewModel,
} from '@trackalize/presentation/view-models'

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
