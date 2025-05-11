import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { IRequest } from '@/presentation/contracts/http'
import { ITokenStorageInvoker } from '@/presentation/contracts/invokers/ITokenStorageInvoker'
import { TokenRequest } from '@/presentation/handlers/TokenHandler'
import { ViewModel } from '@/presentation/view-models/ViewModel'

/* eslint-disable prettier/prettier */
export const tokenStorageInvoker: ITokenStorageInvoker = {
  saveToken: (payload: IRequest<TokenRequest>): Promise<ViewModel<void>> => IpcInvoker.invoke<IRequest<TokenRequest>, ViewModel<void>>('SAVE_TOKEN', payload),
  getToken: (payload: IRequest<TokenRequest>): Promise<ViewModel<string | null>> =>  IpcInvoker.invoke<IRequest<TokenRequest>, ViewModel<string | null>>('GET_TOKEN',  payload),
  deleteToken: (payload: IRequest<TokenRequest>): Promise<ViewModel<void>> => IpcInvoker.invoke<IRequest<TokenRequest>, ViewModel<void>>('DELETE_TOKEN', payload),
}
