import { asClass, createContainer, InjectionMode } from 'awilix'

import { HttpClient } from '@/adapters/http/HttpClient'
import { RedmineTaskMutation } from '@/adapters/mutations/redmine/RedmineTaskMutation'
import { RedmineMemberQuery } from '@/adapters/queries/redmine/RedmineMemberQuery'
import { RedmineTaskQuery } from '@/adapters/queries/redmine/RedmineTaskQuery'
import { AuthenticationService } from '@/application/services/AuthenticationService'
import { ListTaskService } from '@/application/services/ListTasksService'
import { RedmineAuthenticationStrategy } from '@/application/strategies/RedmineAuthenticationStrategy'

export class DependencyInjection {
  private static container: ReturnType<typeof createContainer>

  public static initialize(): void {
    this.container = createContainer({
      injectionMode: InjectionMode.CLASSIC,
    })

    // Atencao ao registar uma nova propriedade, ela deve conter o mesmo nome do parametro de quem a usa como dependencia
    this.container.register({
      httpClient: asClass(HttpClient).scoped(),
      taskQuery: asClass(RedmineTaskQuery).scoped(),
      memberQuery: asClass(RedmineMemberQuery).scoped(),
      taskMutation: asClass(RedmineTaskMutation).scoped(),
      authenticationStrategy: asClass(RedmineAuthenticationStrategy).scoped(),
      authenticationService: asClass(AuthenticationService).scoped(),
      listTaskService: asClass(ListTaskService).scoped(),
    })

    // Verifique o registro para cada dependência
    console.log('Container initialized and dependencies registered:')
    console.log(this.container)
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
