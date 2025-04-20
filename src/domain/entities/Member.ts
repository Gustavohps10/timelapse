export class Member {
  #id: string
  #name: string
  #email: string

  constructor(name: string, email: string) {
      this.#id = crypto.randomUUID()
      this.#name = name
      this.#email = email
  }

  get id(): string {
      return this.#id
  }

  get name(): string {
      return this.#name
  }

  set name(newName: string) {
      this.#name = newName
  }

  get email(): string {
      return this.#email
  }

  set email(newEmail: string) {
      this.#email = newEmail
  }
}
