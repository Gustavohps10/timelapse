import {
  AppError,
  Either,
  InternalServerError,
} from '@timelapse/cross-cutting/helpers'

import { ITaskQuery } from '@/contracts/data'
import { ITaskPullUseCase, PullTasksInput } from '@/contracts/use-cases'
import { TaskDTO } from '@/dtos'
import { SessionManager } from '@/workflow'

export class TaskPullService implements ITaskPullUseCase {
  public constructor(
    private readonly sessionManager: SessionManager,
    private readonly timeEntryQuery: ITaskQuery,
  ) {}

  public async execute(
    input: PullTasksInput,
  ): Promise<Either<AppError, TaskDTO[]>> {
    try {
      const sessionUser = this.sessionManager.getCurrentUser()

      const timeEntries = await this.timeEntryQuery.pull(
        sessionUser!.id,
        input.checkpoint,
        input.batch,
      )

      return Either.success(timeEntries)
    } catch {
      return Either.failure(InternalServerError.danger('ERRO_INESPERADO'))
    }
  }
}
