import { ConnectorDependencies } from '@/Ioc'

export interface IServiceProvider {
  resolve<T>(token: string): T
  createScope(): IServiceProvider
  withConnector(deps: ConnectorDependencies): IServiceProvider
}
