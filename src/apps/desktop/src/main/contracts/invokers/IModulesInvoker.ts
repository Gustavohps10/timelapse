import { IHeadersInvoker } from '@/main/contracts/invokers/IHeadersInvoker'
import { ISystemInvoker } from '@/main/contracts/invokers/ISystemInvoker'
import { ITokenStorageInvoker } from '@/main/contracts/invokers/ITokenStorageInvoker'

export interface IModulesInvoker {
  tokenStorage: ITokenStorageInvoker
  headers: IHeadersInvoker
  system: ISystemInvoker
}
