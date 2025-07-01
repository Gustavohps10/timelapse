import { IIntegrationsInvoker } from '@/presentation/contracts/invokers/IIntegrationsInvoker'
import { IModulesInvoker } from '@/presentation/contracts/invokers/IModulesInvoker'
import { IServicesInvoker } from '@/presentation/contracts/invokers/IServicesInvoker'

export interface IWindowAPIInvoker {
  services: IServicesInvoker
  modules: IModulesInvoker
  integrations: IIntegrationsInvoker
}
