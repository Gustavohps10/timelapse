import { Container } from 'inversify'

import { TaskRepository } from '@/adapters/repositories/redmine/TaskRepository'
import { ITaskRepository } from '@/application/contracts/ITaskRepository'
import { ListTaskService } from '@/application/services/ListTasksService'
import { IListTasksUseCase } from '@/domain/use-cases/IListTasksUseCase'
import { InterfaceMapping } from '@/Ioc/interface-mapping'

// Necessario o nome da Interface em String para injecao de dependencia funcionar corretamente

export class DependencyInjection {
  private static container: Container

  public static initialize(): void {
    this.container = new Container()

    /* eslint-disable prettier/prettier */
    this.container.bind<IListTasksUseCase>(InterfaceMapping.IListTasksUseCase).to(ListTaskService).inRequestScope()
    this.container.bind<ITaskRepository>(InterfaceMapping.ITaskRepository).to(TaskRepository).inRequestScope()
  }

  public static get<T>(type: symbol): T {
    if (!this.container) throw new Error('DependencyInjection not initialized')
    return this.container.get<T>(type)
  }

  public static getContainer(): Container {
    if (!this.container) throw new Error('DependencyInjection not initialized')
    return this.container
  }
}
