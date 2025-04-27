import { asClass, createContainer, InjectionMode } from 'awilix'

import { HttpClient } from '@/adapters/http/HttpClient'
import { TaskMutation } from '@/adapters/mutations/redmine/TaskMutation'
import { TaskQuery } from '@/adapters/queries/redmine/TaskQuery'
import { ListTaskService } from '@/application/services/ListTasksService'

export class DependencyInjection {
  private static container: ReturnType<typeof createContainer>

  public static initialize(): void {
    this.container = createContainer({
      injectionMode: InjectionMode.CLASSIC,
    })

    // Atencao ao registar uma nova dependencia, a propriedade deve conter o mesmo nome de quando for injedata
    this.container.register({
      httpClient: asClass(HttpClient).scoped(),
      taskQuery: asClass(TaskQuery).scoped(),
      taskMutation: asClass(TaskMutation).scoped(),
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
