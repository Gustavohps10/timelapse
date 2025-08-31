import { Entity } from '@/entities/Entity'

export class TimeEntry extends Entity {
  #id: string
  #project: { id: number; name: string }
  #issue: { id: number }
  #user: { id: number; name: string }
  #activity: { id: number; name: string }
  #hours: number
  #comments: string
  #spentOn: Date
  #createdAt: Date
  #updatedAt: Date

  private constructor(
    id: string,
    project: { id: number; name: string },
    issue: { id: number },
    user: { id: number; name: string },
    activity: { id: number; name: string },
    hours: number,
    comments: string,
    spentOn: Date,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super()
    this.#id = id
    this.#project = project
    this.#issue = issue
    this.#user = user
    this.#activity = activity
    this.#hours = hours
    this.#comments = comments
    this.#spentOn = spentOn
    this.#createdAt = createdAt
    this.#updatedAt = updatedAt
  }

  static create(props: {
    id: string
    project: { id: number; name: string }
    issue: { id: number }
    user: { id: number; name: string }
    activity: { id: number; name: string }
    hours: number
    comments: string
    spentOn: Date
  }): TimeEntry {
    const now = new Date()
    return new TimeEntry(
      props.id,
      props.project,
      props.issue,
      props.user,
      props.activity,
      props.hours,
      props.comments,
      props.spentOn,
      now,
      now,
    )
  }

  get id(): string {
    return this.#id
  }

  get project() {
    return this.#project
  }

  get issue() {
    return this.#issue
  }

  get user() {
    return this.#user
  }

  get activity() {
    return this.#activity
  }

  get hours(): number {
    return this.#hours
  }

  get comments(): string {
    return this.#comments
  }

  get spentOn(): Date {
    return this.#spentOn
  }

  get createdAt(): Date {
    return this.#createdAt
  }

  get updatedAt(): Date {
    return this.#updatedAt
  }

  updateHours(hours: number) {
    this.#hours = hours
    this.touch()
  }

  updateComments(comments: string) {
    this.#comments = comments
    this.touch()
  }

  private touch() {
    this.#updatedAt = new Date()
  }
}
