// UTILITÁRIO: Serviço para manipulação de Tasks (fallback, criação, busca)
// Não contém lógica de replicação/sincronização RxDB. Use apenas se precisar manipular tasks locais.
import { IApplicationClient, TaskDTO } from '@timelapse/application'
import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { getDatabase } from './syncEngine'

export class TaskService {
  private dbPromise: Promise<any>

  constructor(private applicationClient: IApplicationClient) {
    this.dbPromise = getDatabase()
  }

  /**
   * Gets or creates a fallback Task for a workspace
   * This is used when data sources don't support tasks (like Clockify)
   */
  async getOrCreateFallbackTask(
    workspaceId: string,
  ): Promise<Either<AppError, TaskDTO>> {
    try {
      const db = await this.dbPromise

      // Try to find existing fallback task
      const existingTask = await db.tasks
        .findOne({
          selector: {
            workspaceId,
            isFallback: true,
          },
        })
        .exec()

      if (existingTask) {
        return Either.success(this.mapToDTO(existingTask))
      }

      // Create new fallback task
      const fallbackTask = {
        id: `fallback-${workspaceId}-${Date.now()}`,
        title: 'General Task',
        description: 'Fallback task for time entries without specific tasks',
        workspaceId,
        isFallback: true,
        externalId: undefined,
        externalType: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _deleted: false,
      }

      await db.tasks.insert(fallbackTask)

      return Either.success(this.mapToDTO(fallbackTask))
    } catch (error) {
      return Either.failure(
        new AppError(
          'TASK_FALLBACK_ERROR',
          error instanceof Error
            ? error.message
            : 'Erro ao criar Task fallback',
          500,
        ),
      )
    }
  }

  /**
   * Creates a Task from external data source
   */
  async createTaskFromExternal(
    workspaceId: string,
    externalData: {
      id: string
      title: string
      description?: string
      type?: string
    },
  ): Promise<Either<AppError, TaskDTO>> {
    try {
      const db = await this.dbPromise

      const task = {
        id: `external-${externalData.id}-${workspaceId}`,
        title: externalData.title,
        description: externalData.description || '',
        workspaceId,
        isFallback: false,
        externalId: externalData.id,
        externalType: externalData.type || 'task',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _deleted: false,
      }

      await db.tasks.insert(task)

      return Either.success(this.mapToDTO(task))
    } catch (error) {
      return Either.failure(
        new AppError(
          'TASK_CREATE_ERROR',
          error instanceof Error ? error.message : 'Erro ao criar Task',
          500,
        ),
      )
    }
  }

  /**
   * Gets Task by ID
   */
  async getTaskById(taskId: string): Promise<Either<AppError, TaskDTO | null>> {
    try {
      const db = await this.dbPromise

      const task = await db.tasks
        .findOne({
          selector: {
            id: taskId,
          },
        })
        .exec()

      if (!task) {
        return Either.success(null)
      }

      return Either.success(this.mapToDTO(task))
    } catch (error) {
      return Either.failure(
        new AppError(
          'TASK_GET_ERROR',
          error instanceof Error ? error.message : 'Erro ao buscar Task',
          500,
        ),
      )
    }
  }

  /**
   * Lists Tasks by workspace
   */
  async getTasksByWorkspace(
    workspaceId: string,
  ): Promise<Either<AppError, TaskDTO[]>> {
    try {
      const db = await this.dbPromise

      const tasks = await db.tasks
        .find({
          selector: {
            workspaceId,
            _deleted: { $ne: true },
          },
        })
        .exec()

      const taskDTOs = tasks.map((task: any) => this.mapToDTO(task))

      return Either.success(taskDTOs)
    } catch (error) {
      return Either.failure(
        new AppError(
          'TASK_LIST_ERROR',
          error instanceof Error ? error.message : 'Erro ao listar Tasks',
          500,
        ),
      )
    }
  }

  private mapToDTO(task: any): TaskDTO {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      workspaceId: task.workspaceId,
      isFallback: task.isFallback,
      externalId: task.externalId,
      externalType: task.externalType,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }
  }
}
