import { IIntegrationsInvoker } from '@/main/contracts/invokers/IIntegrationsInvoker'
import { IModulesInvoker } from '@/main/contracts/invokers/IModulesInvoker'
import { IServicesInvoker } from '@/main/contracts/invokers/IServicesInvoker'

export interface IWindowAPIInvoker {
  services: IServicesInvoker
  modules: IModulesInvoker
  integrations: IIntegrationsInvoker
}
