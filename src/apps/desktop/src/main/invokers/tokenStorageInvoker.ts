import { IRequest } from '@trackalize/cross-cutting/transport'
import { ViewModel } from '@trackalize/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { ITokenStorageInvoker } from '@/main/contracts/invokers'
import { TokenRequest } from '@/main/handlers'

/* eslint-disable prettier/prettier */
export const tokenStorageInvoker: ITokenStorageInvoker = {
  saveToken: (payload: IRequest<TokenRequest>): Promise<ViewModel<void>> => IpcInvoker.invoke<IRequest<TokenRequest>, ViewModel<void>>('SAVE_TOKEN', payload),
  getToken: (payload: IRequest<TokenRequest>): Promise<ViewModel<string | null>> =>  IpcInvoker.invoke<IRequest<TokenRequest>, ViewModel<string | null>>('GET_TOKEN',  payload),
  deleteToken: (payload: IRequest<TokenRequest>): Promise<ViewModel<void>> => IpcInvoker.invoke<IRequest<TokenRequest>, ViewModel<void>>('DELETE_TOKEN', payload),
}
