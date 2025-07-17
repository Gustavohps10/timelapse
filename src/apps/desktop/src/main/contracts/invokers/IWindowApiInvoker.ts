import { IIntegrationsInvoker } from '@/main/contracts/invokers/IIntegrationsInvoker'
import { IModulesInvoker } from '@/main/contracts/invokers/IModulesInvoker'
import { IServicesInvoker } from '@/main/contracts/invokers/IServicesInvoker'
import { IWorkspacesInvoker } from '@/main/contracts/invokers/IWorkspacesInvoker'

export interface IWindowAPIInvoker {
  workspaces: IWorkspacesInvoker
  services: IServicesInvoker
  modules: IModulesInvoker
  integrations: IIntegrationsInvoker
}
