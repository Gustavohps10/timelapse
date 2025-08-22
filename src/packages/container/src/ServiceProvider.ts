import { asValue, AwilixContainer } from 'awilix'

import { ConnectorDependencies } from '@/Ioc'
import { IServiceProvider } from '@/IServiceProvider'

export class ServiceProvider implements IServiceProvider {
  private scopeCache = new Map<string, IServiceProvider>()

  constructor(private readonly container: AwilixContainer) {}

  resolve<T>(token: string): T {
    return this.container.resolve<T>(token)
  }

  createScope(scopeKey?: string): IServiceProvider {
    if (scopeKey && this.scopeCache.has(scopeKey)) {
      return this.scopeCache.get(scopeKey)!
    }

    const scoped = this.container.createScope()
    const scopedProvider = new ServiceProvider(scoped)

    if (scopeKey) {
      this.scopeCache.set(scopeKey, scopedProvider)
    }

    return scopedProvider
  }

  withConnector(
    deps: ConnectorDependencies,
    scopeKey?: string,
  ): IServiceProvider {
    const scoped = this.container.createScope()
    scoped.register({
      authenticationStrategy: asValue(deps.authenticationStrategy),
      taskQuery: asValue(deps.taskQuery),
      memberQuery: asValue(deps.memberQuery),
      timeEntryQuery: asValue(deps.timeEntryQuery),
      taskMutation: asValue(deps.taskMutation),
    })

    const scopedProvider = new ServiceProvider(scoped)

    if (scopeKey) {
      this.scopeCache.set(scopeKey, scopedProvider)
    }

    return scopedProvider
  }
}
