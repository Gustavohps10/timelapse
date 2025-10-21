import {
  AppError,
  Either,
  ValidationError,
} from '@timelapse/cross-cutting/helpers'
import { randomUUID } from 'crypto'

import { Entity } from '@/entities/Entity'

export type DataSource = 'local' | string

export class Workspace extends Entity {
  private _id: string
  private _name: string
  private _dataSource: DataSource
  private _dataSourceConfiguration?: Record<string, unknown>
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(
    id: string,
    name: string,
    updatedAt: Date,
    createdAt: Date,
  ) {
    super()
    this._id = id
    this._name = name
    this._createdAt = createdAt
    this._updatedAt = updatedAt
    this._dataSource = 'local'
  }

  static create(name: string): Workspace {
    const now = new Date()
    return new Workspace(`ws-${randomUUID()}`, name, now, now)
  }

  get id(): string {
    return this._id
  }
  private set id(value: string) {
    this._id = value
  }

  get name(): string {
    return this._name
  }
  private set name(value: string) {
    this._name = value
  }

  get dataSource(): DataSource {
    return this._dataSource
  }
  private set dataSource(value: DataSource) {
    this._dataSource = value
  }

  get dataSourceConfiguration(): Record<string, unknown> | undefined {
    return this._dataSourceConfiguration
  }
  private set dataSourceConfiguration(
    value: Record<string, unknown> | undefined,
  ) {
    this._dataSourceConfiguration = value
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

  isLinked(): boolean {
    return this._dataSource !== 'local'
  }

  isConfigured(): boolean {
    return this._dataSourceConfiguration !== undefined
  }

  isConnected(): boolean {
    return this.isLinked() && this.isConfigured()
  }

  linkDataSource(dataSource: string): Either<AppError, void> {
    if (dataSource === 'local') {
      return Either.failure(
        ValidationError.danger('Não é possível vincular o DataSource local'),
      )
    }

    this._dataSource = dataSource
    this._dataSourceConfiguration = undefined
    this.touch()
    return Either.success(undefined)
  }

  unlinkDataSource(): Either<AppError, void> {
    console.log(
      'DOMINIO: Unlinking data source........................................',
    )
    this._dataSource = 'local'
    this._dataSourceConfiguration = undefined
    this.touch()
    return Either.success(undefined)
  }

  connectDataSource(config: Record<string, unknown>): Either<AppError, void> {
    if (this._dataSource === 'local') {
      return Either.failure(
        ValidationError.danger('Não é possível conectar o DataSource local'),
      )
    }

    this._dataSourceConfiguration = config
    this.touch()
    return Either.success(undefined)
  }

  disconnectDataSource(): Either<AppError, void> {
    console.log(
      'DOMINIO: Disconnecting data sourc.......................................',
    )
    this._dataSourceConfiguration = undefined
    this.touch()
    return Either.success(undefined)
  }

  updateName(newName: string) {
    this._name = newName
    this.touch()
  }

  private touch() {
    this._updatedAt = new Date()
  }
}
