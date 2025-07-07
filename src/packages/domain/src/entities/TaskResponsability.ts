import { Member, Task } from '@/entities'
import { Role } from '@/value-objects'

export class TaskResponsibility {
  #id: string
  #task: Task
  #member: Member
  #role: Role
  #assignedAt: Date

  constructor(task: Task, member: Member, role: Role) {
    this.#id = crypto.randomUUID()
    this.#task = task
    this.#member = member
    this.#role = role
    this.#assignedAt = new Date()
  }

  get id(): string {
    return this.#id
  }

  get task(): Task {
    return this.#task
  }

  get member(): Member {
    return this.#member
  }

  get role(): Role {
    return this.#role
  }

  set role(newRole: Role) {
    this.#role = newRole
  }

  get assignedAt(): Date {
    return this.#assignedAt
  }
}
