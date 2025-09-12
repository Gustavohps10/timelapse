import { AppError, Either } from '@timelapse/cross-cutting/helpers'
import { randomUUID } from 'crypto'

import { Entity } from '@/entities/Entity'

// Tipo para as propriedades, facilitando a manutenção
export type TimeEntryProps = {
  project: { id: number; name: string }
  issue: { id: number }
  user: { id: number; name: string }
  activity: { id: number; name: string }
  hours: number
  comments: string
  spentOn: Date
}

export class TimeEntry extends Entity {
  private _id: string
  private _project: { id: number; name: string }
  private _issue: { id: number }
  private _user: { id: number; name: string }
  private _activity: { id: number; name: string }
  private _hours: number
  private _comments: string
  private _spentOn: Date
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(
    props: TimeEntryProps,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super()
    this._id = id
    this._project = props.project
    this._issue = props.issue
    this._user = props.user
    this._activity = props.activity
    this._hours = props.hours
    this._comments = props.comments
    this._spentOn = props.spentOn
    this._createdAt = createdAt
    this._updatedAt = updatedAt
  }

  static create(props: TimeEntryProps): TimeEntry {
    const now = new Date()
    const id = `${randomUUID()}`
    return new TimeEntry(props, id, now, now)
  }

  get id(): string {
    return this._id
  }
  private set id(value: string) {
    this._id = value
  }

  get project() {
    return this._project
  }
  private set project(value: { id: number; name: string }) {
    this._project = value
  }

  get issue() {
    return this._issue
  }
  private set issue(value: { id: number }) {
    this._issue = value
  }

  get user() {
    return this._user
  }
  private set user(value: { id: number; name: string }) {
    this._user = value
  }

  get activity() {
    return this._activity
  }
  private set activity(value: { id: number; name: string }) {
    this._activity = value
  }

  get hours(): number {
    return this._hours
  }
  private set hours(value: number) {
    this._hours = value
  }

  get comments(): string {
    return this._comments
  }
  private set comments(value: string) {
    this._comments = value
  }

  get spentOn(): Date {
    return this._spentOn
  }
  private set spentOn(value: Date) {
    this._spentOn = value
  }

  get createdAt(): Date {
    return this._createdAt
  }
  private set createdAt(value: Date) {
    this._createdAt = value
  }

  get updatedAt(): Date {
    return this._updatedAt
  }
  private set updatedAt(value: Date) {
    this._updatedAt = value
  }

  updateHours(hours: number): Either<AppError, void> {
    if (hours < 0) {
      return Either.failure(new AppError('As horas não podem ser negativas.'))
    }
    this._hours = hours
    this.touch()
    return Either.success(undefined)
  }

  updateComments(comments: string): Either<AppError, void> {
    this._comments = comments
    this.touch()
    return Either.success(undefined)
  }

  private touch() {
    this._updatedAt = new Date()
  }
}
