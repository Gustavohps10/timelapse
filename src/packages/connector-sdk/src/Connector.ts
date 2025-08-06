import {
  IAuthenticationStrategy,
  IMemberQuery,
  ITaskMutation,
  ITaskQuery,
  ITimeEntryQuery,
} from '@trackalize/application'

export interface ConfigField {
  id: string
  label: string
  type: 'text' | 'password' | 'url'
  required: boolean
  placeholder?: string
  persistable: boolean
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

// No seu SDK
export interface IConnector {
  readonly id: string
  readonly dataSourceType: string
  readonly displayName: string
  readonly configFields: FieldGroup[]

  getAuthenticationStrategy(context: Context): IAuthenticationStrategy
  getTaskQuery(context: Context): ITaskQuery
  getTimeEntryQuery(context: Context): ITimeEntryQuery
  getMemberQuery(context: Context): IMemberQuery
  getTaskMutation(context: Context): ITaskMutation
}
