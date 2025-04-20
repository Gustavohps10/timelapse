import { Task } from "@/domain/entities"

export interface ListTasks {
  execute(): Promise<Task[]>
}
