import { TaskStatus } from "@/domain/value-objects";

export interface ChangeTaskStatus {
  execute(taskId: string, newStatus: TaskStatus): Promise<void>
}
