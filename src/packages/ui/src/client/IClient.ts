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

export interface AddonManifest {
  id: string
  name: string
  creator: string
  description: string
  path: string
  logo: string
  downloads: number
  version: string
  stars: number
  installed: boolean
  installerManifestUrl?: string
  sourceUrl?: string
  tags?: string[]
}

export type FileData =
  | Uint8Array
  | Buffer
  | NodeJS.ReadableStream
  | ReadableStream<Uint8Array>

export interface AddonInstaller {
  id: string
  packages: {
    version: string
    requiredApiVersion: string
    releaseDate: string
    downloadUrl: string
    changelog: string[]
  }[]
}

export interface IAddonsClient {
  list(): Promise<AddonManifest[]>
  getById(addonId: string): Promise<AddonManifest>
  updateLocal?(addon: AddonManifest): Promise<void>
  import(
    payload: IRequest<{
      addon: FileData
    }>,
  ): Promise<ViewModel>
  getInstaller(
    payload: IRequest<{ installerUrl: string }>,
  ): Promise<AddonInstaller>
  install(
    payload: IRequest<
      { downloadUrl: string } & { onProgress?: (progress: number) => void }
    >,
  ): Promise<ViewModel>
}

export interface ISystemClient {
  getAppVersion(): Promise<string>
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
    system: ISystemClient
  }
  integrations: {
    discord: IDiscordClient
    addons: IAddonsClient
  }
}
