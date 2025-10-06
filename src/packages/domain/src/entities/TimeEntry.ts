import { Either, ValidationError } from '@timelapse/cross-cutting/helpers'
import { randomUUID } from 'crypto'
import z from 'zod'

import { Entity } from '@/entities/Entity'

export type TimeEntryProps = {
  task?: { id: string }
  project?: { id: number; name: string }
  user?: { id: number; name: string }
  activity?: { id: number; name: string }
  hours?: number
  comments?: string
  spentOn?: Date
}

const TimeEntrySchema = z.object({
  task: z.object({ id: z.string() }),
  project: z.object({ id: z.number(), name: z.string() }),
  user: z.object({ id: z.number(), name: z.string() }),
  activity: z.object({ id: z.number(), name: z.string() }),
  hours: z.number().nonnegative(),
  comments: z.string(),
  spentOn: z.date(),
})

export class TimeEntry extends Entity {
  private _id: string
  private _task: { id: string }
  private _project: { id: number; name: string }
  private _user: { id: number; name: string }
  private _activity: { id: number; name: string }
  private _hours: number
  private _comments: string
  private _spentOn: Date
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(
    props: z.infer<typeof TimeEntrySchema>,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super()
    this._id = id
    this._task = props.task
    this._project = props.project
    this._user = props.user
    this._activity = props.activity
    this._hours = props.hours
    this._comments = props.comments
    this._spentOn = props.spentOn
    this._createdAt = createdAt
    this._updatedAt = updatedAt
  }

  static create(
    props: Partial<TimeEntryProps>,
  ): Either<ValidationError, TimeEntry> {
    const parsed = TimeEntrySchema.safeParse(props)
    if (!parsed.success) {
      const details: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(parsed.error.format())) {
        if (
          '_errors' in value &&
          Array.isArray(value._errors) &&
          value._errors.length > 0
        ) {
          details[key] = value._errors as string[]
        }
      }
      return Either.failure(ValidationError.danger('CAMPOS_INVALIDOS', details))
    }

    const now = new Date()
    const id = randomUUID()
    return Either.success(new TimeEntry(parsed.data, id, now, now))
  }

  get id(): string {
    return this._id
  }
  get task() {
    return this._task
  }
  get project() {
    return this._project
  }
  get user() {
    return this._user
  }
  get activity() {
    return this._activity
  }
  get hours(): number {
    return this._hours
  }
  get comments(): string {
    return this._comments
  }
  get spentOn(): Date {
    return this._spentOn
  }
  get createdAt(): Date {
    return this._createdAt
  }
  get updatedAt(): Date {
    return this._updatedAt
  }

  updateHours(hours: number): Either<ValidationError, void> {
    if (hours < 0) {
      return Either.failure(
        ValidationError.danger('HOURS_INVALID', {
          hours: ['Deve ser maior que 0'],
        }),
      )
    }
    this._hours = hours
    this.touch()
    return Either.success(undefined)
  }

  updateComments(comments: string): Either<ValidationError, void> {
    this._comments = comments
    this.touch()
    return Either.success(undefined)
  }

  private touch() {
    this._updatedAt = new Date()
  }
}
