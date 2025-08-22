import { IHeaders, IRequest } from '@trackalize/cross-cutting/transport'
import {
  AuthenticationViewModel,
  MemberViewModel,
  PaginatedViewModel,
  TaskViewModel,
  TimeEntryViewModel,
  ViewModel,
  WorkspaceViewModel,
} from '@trackalize/presentation/view-models'

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

export interface IWorkspacesClient {
  create(
    input: IRequest<{
      name: string
      pluginId?: string
      pluginConfig?: Record<string, unknown>
    }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  listAll(): Promise<PaginatedViewModel<WorkspaceViewModel[]>>

  getPluginFields(): Promise<FieldGroup[]>
}

export interface ISessionClient {
  getCurrentUser(
    input: IRequest<{
      workspaceId: string
    }>,
  ): Promise<ViewModel<MemberViewModel>>
}

interface LoginRequest<AuthCredentials> {
  workspaceId: string
  credentials: AuthCredentials
}

export interface IAuthClient {
  login: <T>(
    payload: IRequest<LoginRequest<T>>,
  ) => Promise<ViewModel<AuthenticationViewModel>>
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
  workspaces: IWorkspacesClient
  services: {
    session: ISessionClient
    auth: IAuthClient
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
