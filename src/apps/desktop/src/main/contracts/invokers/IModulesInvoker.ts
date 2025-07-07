import { IHeadersInvoker } from '@/main/contracts/invokers/IHeadersInvoker'
import { ITokenStorageInvoker } from '@/main/contracts/invokers/ITokenStorageInvoker'

export interface IModulesInvoker {
  tokenStorage: ITokenStorageInvoker
  headers: IHeadersInvoker
}
