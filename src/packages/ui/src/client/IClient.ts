import { IHeaders, IRequest } from '@timelapse/cross-cutting/transport'
import {
  AuthenticationViewModel,
  MemberViewModel,
  PaginatedViewModel,
  TaskViewModel,
  TimeEntryViewModel,
  ViewModel,
  WorkspaceViewModel,
} from '@timelapse/presentation/view-models'

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

export interface IWorkspacesClient {
  create(
    input: IRequest<{
      name: string
    }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  getById(
    input: IRequest<{ workspaceId: string }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  listAll(): Promise<PaginatedViewModel<WorkspaceViewModel[]>>

  getDataSourceFields(): Promise<{
    credentials: FieldGroup[]
    configuration: FieldGroup[]
  }>

  linkDataSource(
    input: IRequest<{
      workspaceId: string
      dataSource: string
    }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  unlinkDataSource(
    input: IRequest<{
      workspaceId: string
    }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  connectDataSource(
    input: IRequest<{
      workspaceId: string
      configuration: Record<string, unknown>
      credentials: Record<string, unknown>
    }>,
  ): Promise<ViewModel<AuthenticationViewModel>>

  disconnectDataSource(
    input: IRequest<{
      workspaceId: string
    }>,
  ): Promise<ViewModel<WorkspaceViewModel>>
}

export interface ISessionClient {
  getCurrentUser(
    input: IRequest<{
      workspaceId: string
    }>,
  ): Promise<ViewModel<MemberViewModel>>
}

export interface ITaskClient {
  listTasks: () => Promise<PaginatedViewModel<TaskViewModel[]>>
}

export interface ITimeEntriesClient {
  findByMemberId: (
    payload: IRequest<{
      workspaceId: string
      memberId: string
      startDate: Date
      endDate: Date
    }>,
  ) => Promise<PaginatedViewModel<TimeEntryViewModel[]>>
}

export interface IHeadersClient {
  setDefaultHeaders(headers: IHeaders): void
  getDefaultHeaders(): IHeaders
}

export interface ITokenStorageClient {
  saveToken(
    request: IRequest<{
      service: string
      account: string
      token: string
    }>,
  ): Promise<ViewModel<void>>

  getToken(
    request: IRequest<{
      service: string
      account: string
    }>,
  ): Promise<ViewModel<string | null>>

  deleteToken(
    request: IRequest<{
      service: string
      account: string
    }>,
  ): Promise<ViewModel<void>>
}

export interface IDiscordClient {
  login(): Promise<{
    id: string
    username: string
    avatar: string
    global_name: string | null
    avatarUrl: string
  }>
}

export interface IClient {
  services: {
    workspaces: IWorkspacesClient
    session: ISessionClient
    tasks: ITaskClient
    timeEntries: ITimeEntriesClient
  }
  modules: {
    headers: IHeadersClient
    tokenStorage: ITokenStorageClient
  }
  integrations: {
    discord: IDiscordClient
  }
}
