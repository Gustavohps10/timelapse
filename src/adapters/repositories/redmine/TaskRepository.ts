import { IHttpClient } from '@/adapters/interfaces/IHttpClient'
import { ITaskRepository } from '@/application/contracts/ITaskRepository'
import { TaskDTO } from '@/application/dto/TaskDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export class TaskRepository implements ITaskRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async create(taskData: TaskDTO): Promise<Either<AppError, TaskDTO>> {
    return await this.httpClient.post<TaskDTO>('/tasks', taskData)
  }

  async exists(id: string): Promise<Either<AppError, boolean>> {
    throw new Error('Method not implemented.')
  }

  async findById(id: string): Promise<Either<AppError, TaskDTO>> {
    throw new Error('Method not implemented.')
  }

  async findAll(): Promise<Either<AppError, TaskDTO[]>> {
    throw new Error('Method not implemented.')
  }
}
