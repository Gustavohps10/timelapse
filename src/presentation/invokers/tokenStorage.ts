import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { TokenRequest } from '@/presentation/handlers/TokenHandler'
import { ITokenStorage } from '@/presentation/interfaces/ITokenStorage'
import { ViewModel } from '@/presentation/view-models/ViewModel'

/* eslint-disable prettier/prettier */
export const tokenStorage: ITokenStorage = {
  saveToken: (payload: TokenRequest): Promise<ViewModel<void>> => IpcInvoker.invoke<TokenRequest, ViewModel<void>>('SAVE_TOKEN', payload),
  getToken: (payload: TokenRequest): Promise<ViewModel<string | null>> =>  IpcInvoker.invoke<TokenRequest, ViewModel<string | null>>(  'GET_TOKEN',  payload),
  deleteToken: (payload: TokenRequest): Promise<ViewModel<void>> => IpcInvoker.invoke<TokenRequest, ViewModel<void>>('DELETE_TOKEN', payload),
}
