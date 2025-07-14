import { ITaskMutation, Task } from '@trackalize/connector-sdk'

export class RedmineTaskMutation implements ITaskMutation {
  create(entity: Task): Promise<Task> {
    throw new Error('Method create RedmineTaskMutation not implemented.')
  }
  update(id: string, entity: Partial<Task>): Promise<Task | null> {
    throw new Error('Method update RedmineTaskMutation not implemented.')
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method delete RedmineTaskMutation not implemented.')
  }
}
