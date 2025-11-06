import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { TaskDTO } from '@/dtos'

export type PullTasksInput = {
  checkpoint: { updatedAt: Date; id: string }
  batch: number
}

export interface ITaskPullUseCase {
  execute(input: PullTasksInput): Promise<Either<AppError, TaskDTO[]>>
}
