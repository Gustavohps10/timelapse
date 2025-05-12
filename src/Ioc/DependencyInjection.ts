import { asClass, createContainer, InjectionMode } from 'awilix'

import { AuthenticationService } from '@/application/services/AuthenticationService'
import { ListTaskService } from '@/application/services/ListTasksService'
import { ListTimeEntriesService } from '@/application/services/ListTimeEntriesService'
import { RedmineAuthenticationStrategy } from '@/application/strategies/RedmineAuthenticationStrategy'
import { SessionManager } from '@/application/workflow/SessionManager'
import { JwtService } from '@/infra/auth/JWTService'
import { RedmineTaskMutation } from '@/infra/data/mutations/redmine/RedmineTaskMutation'
import { RedmineMemberQuery } from '@/infra/data/queries/redmine/RedmineMemberQuery'
import { RedmineTaskQuery } from '@/infra/data/queries/redmine/RedmineTaskQuery'
import { RedmineTimeEntryQuery } from '@/infra/data/queries/redmine/RedmineTimeEntryQuery'
import { HttpClient } from '@/infra/http/HttpClient'
import { KeytarTokenStorage } from '@/infra/storage/KeytarTokenStorage'
import { UnitOfWork } from '@/infra/workflow/UnitOfWork'
import {
  AuthHandler,
  TaskHandler,
  TimeEntriesHandler,
  TokenHandler,
} from '@/presentation/handlers'

export class DependencyInjection {
  private static container: ReturnType<typeof createContainer>
  private static currentScope: ReturnType<typeof createContainer> | null = null

  public static initialize(): void {
    this.container = createContainer({
      injectionMode: InjectionMode.CLASSIC,
    })

    // Infrastructure
    this.container.register({
      unitOfWork: asClass(UnitOfWork).scoped(),
      httpClient: asClass(HttpClient).scoped(),
      tokenStorage: asClass(KeytarTokenStorage).scoped(),
      jwtService: asClass(JwtService).scoped(),
    })

    // Queries
    this.container.register({
      taskQuery: asClass(RedmineTaskQuery).scoped(),
      memberQuery: asClass(RedmineMemberQuery).scoped(),
      timeEntryQuery: asClass(RedmineTimeEntryQuery).scoped(),
    })

    // Mutations
    this.container.register({
      taskMutation: asClass(RedmineTaskMutation).scoped(),
    })

    // Strategies
    this.container.register({
      authenticationStrategy: asClass(RedmineAuthenticationStrategy).scoped(),
    })

    // Services
    this.container.register({
      sessionManager: asClass(SessionManager).scoped(),
      authenticationService: asClass(AuthenticationService).scoped(),
      listTasksService: asClass(ListTaskService).scoped(),
      listTimeEntriesService: asClass(ListTimeEntriesService).scoped(),
    })

    // Handlers
    this.container.register({
      authHandler: asClass(AuthHandler).scoped(),
      taskHandler: asClass(TaskHandler).scoped(),
      timeEntriesHandler: asClass(TimeEntriesHandler).scoped(),
      tokenHandler: asClass(TokenHandler).scoped(),
    })

    console.log('Container initialized and dependencies registered:')
    console.log(this.container)
  }

  public static createOrGetScope(): ReturnType<typeof createContainer> {
    if (!this.currentScope) {
      this.currentScope = this.container.createScope()
    }
    return this.currentScope
  }

  public static clearScope(): void {
    this.currentScope = null
  }

  public static get<T>(type: string): T {
    if (!this.container) throw new Error('DependencyInjection not initialized')
    return this.container.resolve<T>(type)
  }

  public static getContainer() {
    if (!this.container) throw new Error('DependencyInjection not initialized')
    return this.container
  }
}
