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
    private readonly taskQuery: ITaskQuery,
  ) {}

  public async execute(
    input: PullTasksInput,
  ): Promise<Either<AppError, TaskDTO[]>> {
    try {
      const sessionUser = this.sessionManager.getCurrentUser()

      const tasks = await this.taskQuery.pull(
        sessionUser!.id,
        input.checkpoint,
        input.batch,
      )

      return Either.success(tasks)
    } catch (ex) {
      console.error('Error pulling tasks:', ex)
      return Either.failure(InternalServerError.danger('ERRO_INESPERADO'))
    }
  }
}
