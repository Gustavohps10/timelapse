export type DataSourceType = 'local' | 'remote'

export class Workspace {
  #id: string
  #name: string
  #dataSourceType: DataSourceType
  #pluginId?: string
  #config?: string
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

  get config(): string | undefined {
    return this.#config
  }

  get createdAt(): Date {
    return this.#createdAt
  }

  get updatedAt(): Date {
    return this.#updatedAt
  }

  public linkDataSource(
    dataSourceType: DataSourceType,
    pluginId: string,
    config: string,
  ): void {
    if (this.#dataSourceType !== 'local') {
      throw new Error(
        'Este workspace já está vinculado a um datasource e não pode ser alterado.',
      )
    }

    this.#dataSourceType = dataSourceType
    this.#pluginId = pluginId
    this.#config = config
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
