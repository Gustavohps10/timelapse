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

export interface IWorkspacesClient {
  create(
    input: IRequest<{ name: string; pluginId?: string; pluginConfig?: string }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  listAll(): Promise<PaginatedViewModel<WorkspaceViewModel[]>>
}

export interface ISessionClient {
  getCurrentUser(): Promise<ViewModel<MemberViewModel>>
}

export interface IAuthClient {
  login: (
    payload: IRequest<{
      login: string
      password: string
    }>,
  ) => Promise<ViewModel<AuthenticationViewModel>>
}

export interface ITaskClient {
  listTasks: () => Promise<PaginatedViewModel<TaskViewModel[]>>
}

export interface ITimeEntriesClient {
  findByMemberId: (
    payload: IRequest<{
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
