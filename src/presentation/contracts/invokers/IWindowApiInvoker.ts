import { Headers } from '@/presentation/contracts/http'
import { IModulesInvoker } from '@/presentation/contracts/invokers/IModulesInvoker'
import { IServicesInvoker } from '@/presentation/contracts/invokers/IServicesInvoker'

export interface IWindowAPIInvoker {
  services: IServicesInvoker
  modules: IModulesInvoker
  requestInterceptor: (options: any) => Promise<any>
  setDefaultHeaders: (headers: Headers) => void
  getDefaultHeaders: () => Record<string, string>
}
