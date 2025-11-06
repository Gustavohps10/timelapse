import { Entity } from '@/entities/Entity'

export type TaskProps = {
  title: string
  description: string
  workspaceId: string
  isFallback?: boolean
  externalId?: string
  externalType?: string
}

export class Task extends Entity {
  private _id: string
  private _title: string
  private _description: string
  private _workspaceId: string
  private _isFallback: boolean
  private _externalId?: string
  private _externalType?: string
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(
    props: TaskProps,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super()
    this._id = id
    this._title = props.title
    this._description = props.description
    this._workspaceId = props.workspaceId
    this._isFallback = props.isFallback ?? false
    this._externalId = props.externalId
    this._externalType = props.externalType
    this._createdAt = createdAt
    this._updatedAt = updatedAt
  }

  static create(props: TaskProps): Task {
    const now = new Date()
    return new Task(props, crypto.randomUUID(), now, now)
  }

  static createFallback(workspaceId: string): Task {
    return Task.create({
      title: 'General Task',
      description: 'Fallback task for time entries without specific tasks',
      workspaceId,
      isFallback: true,
    })
  }

  get id(): string {
    return this._id
  }

  get title(): string {
    return this._title
  }

  set title(newTitle: string) {
    this._title = newTitle
    this._updatedAt = new Date()
  }

  get description(): string {
    return this._description
  }

  set description(newDescription: string) {
    this._description = newDescription
    this._updatedAt = new Date()
  }

  get workspaceId(): string {
    return this._workspaceId
  }

  get isFallback(): boolean {
    return this._isFallback
  }

  get externalId(): string | undefined {
    return this._externalId
  }

  get externalType(): string | undefined {
    return this._externalType
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }
}
