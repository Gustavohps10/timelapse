// src/domain/entities/TimeEntry.ts

export class TimeEntry {
  #id: number
  #project: { id: number; name: string }
  #issue: { id: number }
  #user: { id: number; name: string }
  #activity: { id: number; name: string }
  #hours: number
  #comments: string
  #spentOn: string
  #createdAt: string
  #updatedAt: string

  constructor(props: {
    id: number
    project: { id: number; name: string }
    issue: { id: number }
    user: { id: number; name: string }
    activity: { id: number; name: string }
    hours: number
    comments: string
    spent_on: string
    created_at: string
    updated_at: string
  }) {
    this.#id = props.id
    this.#project = props.project
    this.#issue = props.issue
    this.#user = props.user
    this.#activity = props.activity
    this.#hours = props.hours
    this.#comments = props.comments
    this.#spentOn = props.spent_on
    this.#createdAt = props.created_at
    this.#updatedAt = props.updated_at
  }

  get id() {
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

  get hours() {
    return this.#hours
  }

  get comments() {
    return this.#comments
  }

  get spentOn() {
    return this.#spentOn
  }

  get createdAt() {
    return this.#createdAt
  }

  get updatedAt() {
    return this.#updatedAt
  }

  //   updateHours(newHours: number) {
  //     if (newHours < 0) throw new Error('Horas não podem ser negativas.')
  //     this.#hours = newHours
  //     this.#updatedAt = new Date().toISOString()
  //   }

  //   updateComments(newComment: string) {
  //     this.#comments = newComment
  //     this.#updatedAt = new Date().toISOString()
  //   }
}
