import { asValue, AwilixContainer } from 'awilix'

import { ConnectorDependencies } from '@/Ioc'
import { IServiceProvider } from '@/IServiceProvider'

export class ServiceProvider implements IServiceProvider {
  constructor(private readonly container: AwilixContainer) {}

  resolve<T>(token: string): T {
    return this.container.resolve<T>(token)
  }

  createScope(): IServiceProvider {
    return new ServiceProvider(this.container.createScope())
  }

  withConnector(deps: ConnectorDependencies): IServiceProvider {
    const scoped = this.container.createScope()
    scoped.register({
      authenticationStrategy: asValue(deps.authenticationStrategy),
      taskQuery: asValue(deps.taskQuery),
      memberQuery: asValue(deps.memberQuery),
      timeEntryQuery: asValue(deps.timeEntryQuery),
      taskMutation: asValue(deps.taskMutation),
    })
    return new ServiceProvider(scoped)
  }
}
