import { IHttpClient } from '@/adapters/interfaces/IHttpClient'
import { ITaskMutation } from '@/application/contracts/mutations/ITaskMutation'
import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export class TaskMutation implements ITaskMutation {
  constructor(private readonly httpClient: IHttpClient) {}

  async create(taskData: TaskDTO): Promise<Either<AppError, TaskDTO>> {
    return await this.httpClient.post<TaskDTO>('/tasks', taskData)
  }
}
