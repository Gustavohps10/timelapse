import { IHeadersInvoker } from '@/presentation/contracts/invokers/IHeadersInvoker'
import { ITokenStorageInvoker } from '@/presentation/contracts/invokers/ITokenStorageInvoker'

export interface IModulesInvoker {
  tokenStorage: ITokenStorageInvoker
  headers: IHeadersInvoker
}
