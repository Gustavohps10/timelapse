export type DataSourceType = 'local' | string

export class Workspace {
  #id: string
  #name: string
  #dataSourceType: DataSourceType
  #pluginId?: string
  #pluginConfig?: Record<string, unknown>
  #createdAt: Date
  #updatedAt: Date

  public constructor(
    id: string,
    name: string,
    dataSourceType: DataSourceType,
    updatedAt: Date,
    createdAt: Date,
  ) {
    this.#id = id
    this.#name = name
    this.#dataSourceType = dataSourceType
    this.#createdAt = createdAt
    this.#updatedAt = updatedAt
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

  public setDataSource(pluginId: string): void {
    this.#dataSourceType = 'remote'
    this.#pluginId = pluginId
    this.#pluginConfig = undefined
    this.touch()
  }

  public updateName(newName: string): void {
    this.#name = newName
    this.touch()
  }

  private touch(): void {
    this.#updatedAt = new Date()
  }
}
