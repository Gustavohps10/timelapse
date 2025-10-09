import {
  IAuthenticationStrategy,
  IMemberQuery,
  ITaskQuery,
  ITaskRepository,
  ITimeEntryQuery,
  ITimeEntryRepository,
} from '@timelapse/application'

export interface ConfigField {
  id: string
  label: string
  type: 'text' | 'password' | 'url'
  required: boolean
  placeholder?: string
}

export interface FieldGroup {
  id: string
  label: string
  description?: string
  fields: ConfigField[]
}

export interface Context {
  credentials?: Record<string, unknown>
  config: any
}

export interface IConnector {
  readonly id: string
  readonly dataSourceType: string
  readonly displayName: string
  readonly configFields: {
    credentials: FieldGroup[]
    configuration: FieldGroup[]
  }

  getAuthenticationStrategy(context: Context): IAuthenticationStrategy
  getTaskQuery(context: Context): ITaskQuery
  getTimeEntryQuery(context: Context): ITimeEntryQuery
  getTimeEntryRepository(context: Context): ITimeEntryRepository
  getMemberQuery(context: Context): IMemberQuery
  getTaskRepository(context: Context): ITaskRepository
}
