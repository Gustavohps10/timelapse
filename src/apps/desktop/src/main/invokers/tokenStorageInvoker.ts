import { ITokenStorageClient } from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'
import { ViewModel } from '@timelapse/presentation/view-models'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { TokenRequest } from '@/main/handlers'

/* eslint-disable prettier/prettier */
export const tokenStorageInvoker: ITokenStorageClient = {
  saveToken: (payload: IRequest<TokenRequest>): Promise<ViewModel<void>> => IpcInvoker.invoke<IRequest<TokenRequest>, ViewModel<void>>('SAVE_TOKEN', payload),
  getToken: (payload: IRequest<TokenRequest>): Promise<ViewModel<string | null>> =>  IpcInvoker.invoke<IRequest<TokenRequest>, ViewModel<string | null>>('GET_TOKEN',  payload),
  deleteToken: (payload: IRequest<TokenRequest>): Promise<ViewModel<void>> => IpcInvoker.invoke<IRequest<TokenRequest>, ViewModel<void>>('DELETE_TOKEN', payload),
}
