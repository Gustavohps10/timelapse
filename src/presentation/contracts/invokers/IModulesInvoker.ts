import { ITokenStorageInvoker } from '@/presentation/contracts/invokers/ITokenStorageInvoker'

export interface IModulesInvoker {
  tokenStorage: ITokenStorageInvoker
}
