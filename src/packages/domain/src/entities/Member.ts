import { Entity } from '@/entities/Entity'

export class Member extends Entity {
  #id: number
  #login: string
  #firstname: string
  #lastname: string
  #admin: boolean
  #createdAt: Date
  #lastLoginOn: Date
  #redmineApiKey: string
  #customFields: { id: number; name: string; value: string }[]

  private constructor(
    id: number,
    login: string,
    firstname: string,
    lastname: string,
    admin: boolean,
    createdAt: Date,
    lastLoginOn: Date,
    redmineApiKey: string,
    customFields: { id: number; name: string; value: string }[],
  ) {
    super()
    this.#id = id
    this.#login = login
    this.#firstname = firstname
    this.#lastname = lastname
    this.#admin = admin
    this.#createdAt = createdAt
    this.#lastLoginOn = lastLoginOn
    this.#redmineApiKey = redmineApiKey
    this.#customFields = customFields
  }

  static create(props: {
    id: number
    login: string
    firstname: string
    lastname: string
    admin: boolean
    redmineApiKey: string
    customFields: { id: number; name: string; value: string }[]
  }): Member {
    const now = new Date()
    return new Member(
      props.id,
      props.login,
      props.firstname,
      props.lastname,
      props.admin,
      now,
      now,
      props.redmineApiKey,
      props.customFields,
    )
  }

  get id(): number {
    return this.#id
  }

  get login(): string {
    return this.#login
  }

  get firstname(): string {
    return this.#firstname
  }

  get lastname(): string {
    return this.#lastname
  }

  get admin(): boolean {
    return this.#admin
  }

  get createdAt(): Date {
    return this.#createdAt
  }

  get lastLoginOn(): Date {
    return this.#lastLoginOn
  }

  get redmineApiKey(): string {
    return this.#redmineApiKey
  }

  get customFields(): { id: number; name: string; value: string }[] {
    return this.#customFields
  }

  updateLogin(login: string) {
    this.#login = login
    this.touch()
  }

  updateName(firstname: string, lastname: string) {
    this.#firstname = firstname
    this.#lastname = lastname
    this.touch()
  }

  updateCustomFields(fields: { id: number; name: string; value: string }[]) {
    this.#customFields = fields
    this.touch()
  }

  private touch() {
    this.#lastLoginOn = new Date()
  }
}
