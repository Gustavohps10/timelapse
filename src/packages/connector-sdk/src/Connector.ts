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

export interface ConnectorRuntimeContext {
  workspaceConfig: Record<string, any>
  sessionData: string | null
}

export interface TrackalizeConnector {
  id: string
  dataSourceType: string
  displayName: string
  configFields: FieldGroup[]

  getAuthenticationStrategy(
    context: ConnectorRuntimeContext,
  ): IAuthenticationStrategy
  getTaskQuery(context: ConnectorRuntimeContext): ITaskQuery
  getTimeEntryQuery(context: ConnectorRuntimeContext): ITimeEntryQuery
  getMemberQuery(context: ConnectorRuntimeContext): IMemberQuery
  getTaskMutation(context: ConnectorRuntimeContext): ITaskMutation
}
