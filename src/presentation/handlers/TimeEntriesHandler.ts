import { DependencyInjection } from '@Ioc/DependencyInjection'

import { TimeEntryDTO } from '@/application/dto/TimeEntryDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IListTimeEntriesUseCase } from '@/domain/use-cases/IListTimeEntriesUseCase'
import { IpcHandler } from '@/presentation/adapters/IpcHandler'
import { PaginatedViewModel } from '@/presentation/view-models/PaginatedViewModel'
import { TimeEntryViewModel } from '@/presentation/view-models/TimeEntryViewModel'

export interface ListTimeEntriesRequest {
  memberId: string
  startDate: Date
  endDate: Date
}

export class TimeEntriesHandler {
  static register(): void {
    IpcHandler.handle<PaginatedViewModel<TimeEntryViewModel[]>>(
      'LIST_TIME_ENTRIES',
      async (
        _event,
        { memberId, startDate, endDate }: ListTimeEntriesRequest,
      ): Promise<PaginatedViewModel<TimeEntryViewModel[]>> => {
        const listTasksService =
          DependencyInjection.get<IListTimeEntriesUseCase>(
            'listTimeEntriesService',
          )

        const result: Either<AppError, TimeEntryDTO[]> =
          await listTasksService.execute(memberId, startDate, endDate)

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
          isSuccess: result.isSuccess(),
          data: timeEntries,
          totalItems: timeEntries.length,
          totalPages: 1,
          currentPage: 1,
        }
      },
    )
  }
}
