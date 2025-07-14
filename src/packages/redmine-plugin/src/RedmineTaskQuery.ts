import {
  AppError,
  Either,
  ITaskQuery,
  TaskDTO,
} from '@trackalize/connector-sdk'

export class RedmineTaskQuery implements ITaskQuery {
  findAll(): Promise<Either<AppError, TaskDTO[]>> {
    throw new Error('Method findAll RedmineTaskQuery not implemented.')
  }

  findById(id: string): Promise<Either<AppError, TaskDTO | null>> {
    throw new Error('Method findById RedmineTaskQuery not implemented.')
  }

  exists(criteria: Partial<TaskDTO>): Promise<Either<AppError, boolean>> {
    throw new Error('Method exists RedmineTaskQuery not implemented.')
  }
}
