import {
  AppError,
  Either,
  InternalServerError,
  UnauthorizedError,
} from '@timelapse/cross-cutting/helpers'

import { ITimeEntryQuery } from '@/contracts/data'
import {
  ITimeEntriesPullUseCase,
  PullTimeEntriesInput,
} from '@/contracts/use-cases'
import { TimeEntryDTO } from '@/dtos'
import { SessionManager } from '@/workflow'

export class TimeEntriesPullService implements ITimeEntriesPullUseCase {
  private readonly sessionManager: SessionManager
  private readonly timeEntryQuery: ITimeEntryQuery

  public constructor(
    sessionManager: SessionManager,
    timeEntryQuery: ITimeEntryQuery,
  ) {
    this.sessionManager = sessionManager
    this.timeEntryQuery = timeEntryQuery
  }

  public async execute(
    input: PullTimeEntriesInput,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    try {
      const sessionUser = this.sessionManager.getCurrentUser()

      if (!sessionUser) {
        return Either.failure(
          UnauthorizedError.danger('Usuário não autenticado.'),
        )
      }

      const timeEntries = await this.timeEntryQuery.pull(
        sessionUser.id,
        input.checkpoint,
        input.batch,
      )

      return Either.success(timeEntries)
    } catch (error) {
      return Either.failure(InternalServerError.danger('ERRO_INESPERADO'))
    }
  }
}
