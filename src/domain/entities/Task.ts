export class Task {
  #id: string
  #title: string
  #description: string
  createdAt: Date
  updatedAt: Date

  constructor(title: string, description: string) {
      this.#id = crypto.randomUUID()
      this.#title = title
      this.#description = description
      this.createdAt = new Date()
      this.updatedAt = new Date()
  }

  get id(): string {
      return this.#id
  }

  get title(): string {
      return this.#title
  }

  set title(newTitle: string) {
      this.#title = newTitle
      this.updatedAt = new Date()
  }

  get description(): string {
      return this.#description
  }

  set description(newDescription: string) {
      this.#description = newDescription
      this.updatedAt = new Date()
  }
}
