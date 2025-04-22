import { asClass, createContainer, InjectionMode } from 'awilix'

import { HttpClient } from '@/adapters/http/HttpClient'
import { TaskRepository } from '@/adapters/repositories/redmine/TaskRepository'
import { ListTaskService } from '@/application/services/ListTasksService'
import { InterfaceMapping } from '@/Ioc/interface-mapping'

export class DependencyInjection {
  private static container: ReturnType<typeof createContainer>

  public static initialize(): void {
    this.container = createContainer({
      injectionMode: InjectionMode.CLASSIC,
    })

    this.container.register({
      [InterfaceMapping.IHttpClient]: asClass(HttpClient).scoped(),
      [InterfaceMapping.ITaskRepository]: asClass(TaskRepository).scoped(),
      [InterfaceMapping.IListTasksUseCase]: asClass(ListTaskService).scoped(),
    })
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
