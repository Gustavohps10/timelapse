import { randomUUID } from 'crypto'

import { Entity } from '@/entities/Entity'

export type DataSourceType = 'local' | string

export class Workspace extends Entity {
  #id: string
  #name: string
  #dataSourceType: DataSourceType
  #pluginId?: string
  #pluginConfig?: Record<string, unknown>
  #createdAt: Date
  #updatedAt: Date

  private constructor(
    id: string,
    name: string,
    updatedAt: Date,
    createdAt: Date,
  ) {
    super()
    this.#id = id
    this.#name = name
    this.#createdAt = createdAt
    this.#updatedAt = updatedAt
    this.#dataSourceType = 'local'
  }

  static create(name: string): Workspace {
    const now = new Date()
    return new Workspace(`ws-${randomUUID()}`, name, now, now)
  }

  get id(): string {
    return this.#id
  }
  get name(): string {
    return this.#name
  }
  get dataSourceType(): DataSourceType {
    return this.#dataSourceType
  }
  get pluginId(): string | undefined {
    return this.#pluginId
  }
  get pluginConfig(): Record<string, unknown> | undefined {
    return this.#pluginConfig
  }
  get createdAt(): Date {
    return this.#createdAt
  }
  get updatedAt(): Date {
    return this.#updatedAt
  }

  setDataSource(pluginId: string) {
    this.#dataSourceType = 'remote'
    this.#pluginId = pluginId
    this.#pluginConfig = undefined
    this.touch()
  }

  updateName(newName: string) {
    this.#name = newName
    this.touch()
  }

  private touch() {
    this.#updatedAt = new Date()
  }
}
