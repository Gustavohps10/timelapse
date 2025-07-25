import {
  AuthenticationService,
  CreateWorkspaceService,
  GetCurrentUserService,
  IAuthenticationStrategy,
  ICredentialsStorage,
  IMemberQuery,
  ITaskMutation,
  ITaskQuery,
  ITimeEntryQuery,
  IWorkspacesRepository,
  ListTaskService,
  ListTimeEntriesService,
  ListWorkspacesService,
} from '@trackalize/application'
import { SessionManager } from '@trackalize/application'
import { JwtService } from '@trackalize/infra/auth'
import { HttpClient } from '@trackalize/infra/http'
import { UnitOfWork } from '@trackalize/infra/workflow'
import {
  asClass,
  AwilixContainer,
  createContainer,
  InjectionMode,
  Resolver,
} from 'awilix'

export interface PlatformDependencies {
  authenticationStrategy: Resolver<IAuthenticationStrategy>
  taskQuery: Resolver<ITaskQuery>
  memberQuery: Resolver<IMemberQuery>
  timeEntryQuery: Resolver<ITimeEntryQuery>
  taskMutation: Resolver<ITaskMutation>
  credentialsStorage: Resolver<ICredentialsStorage>
  workspacesRepository: Resolver<IWorkspacesRepository>
  storagePath: Resolver<string>
}

export function createTrackalizeContainer(
  platformDependencies: PlatformDependencies,
): AwilixContainer {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  })

  container.register({ ...platformDependencies })

  container.register({
    sessionManager: asClass(SessionManager).scoped(),
    authenticationService: asClass(AuthenticationService).scoped(),
    listTasksService: asClass(ListTaskService).scoped(),
    listTimeEntriesService: asClass(ListTimeEntriesService).scoped(),
    getCurrentUserService: asClass(GetCurrentUserService).scoped(),
    createWorkspaceService: asClass(CreateWorkspaceService).scoped(),
    listWorkspacesService: asClass(ListWorkspacesService).scoped(),
  })

  container.register({
    unitOfWork: asClass(UnitOfWork).scoped(),
    httpClient: asClass(HttpClient).transient(),
    jwtService: asClass(JwtService).scoped(),
  })

  console.log('Container for platform created and dependencies registered.')
  return container
}
