import { ITaskMutation } from '@trackpoint/application/contracts'
import { Task } from '@trackpoint/domain'

import { IHttpClient } from '@/contracts'

export class RedmineTaskMutation implements ITaskMutation {
  constructor(private readonly httpClient: IHttpClient) {}

  create(entity: Task): Promise<Task> {
    throw new Error('Method not implemented.')
  }
  update(id: string, entity: Partial<Task>): Promise<Task | null> {
    throw new Error('Method not implemented.')
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
}
