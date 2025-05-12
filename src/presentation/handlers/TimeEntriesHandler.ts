import { TimeEntryDTO } from '@/application/dto/TimeEntryDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IListTimeEntriesUseCase } from '@/domain/use-cases/IListTimeEntriesUseCase'
import { IRequest } from '@/presentation/contracts/http'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TimeEntryViewModel } from '@/presentation/view-models/TimeEntryViewModel'

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
      isSuccess: true,
      data: timeEntries,
      totalItems: timeEntries.length,
      totalPages: 1,
      currentPage: 1,
    }
  }
}
