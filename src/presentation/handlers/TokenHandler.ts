import { DependencyInjection } from '@Ioc/DependencyInjection'

import { ITokenStorage } from '@/application/contracts/storage/ITokenStorage'
import { IpcHandler } from '@/presentation/adapters/ipcHandler'
import { ViewModel } from '@/presentation/view-models/ViewModel'

export interface TokenRequest {
  service: string
  account: string
  token?: string
}

export class TokenHandler {
  static register(): void {
    // Salvar Token
    IpcHandler.handle<ViewModel<void>>(
      'SAVE_TOKEN',
      async (
        _event,
        { service, account, token }: TokenRequest,
      ): Promise<ViewModel<void>> => {
        const tokenStorage =
          DependencyInjection.get<ITokenStorage>('tokenStorage')

        try {
          if (!token) {
            return {
              isSuccess: false,
              error: 'Token is required',
              data: undefined,
            }
          }

          await tokenStorage.saveToken(service, account, token)

          return {
            isSuccess: true,
            data: undefined,
          }
        } catch {
          return {
            isSuccess: false,
            error: 'Failed to save the token',
            data: undefined,
          }
        }
      },
    )

    // Obter Token
    IpcHandler.handle<ViewModel<string | null>>(
      'GET_TOKEN',
      async (
        _event,
        { service, account }: TokenRequest,
      ): Promise<ViewModel<string | null>> => {
        const tokenStorage =
          DependencyInjection.get<ITokenStorage>('tokenStorage')

        try {
          const token = await tokenStorage.getToken(service, account)

          return {
            isSuccess: true,
            data: token,
          }
        } catch {
          return {
            isSuccess: false,
            error: 'Failed to get the token',
            data: null,
          }
        }
      },
    )

    // Deletar Token
    IpcHandler.handle<ViewModel<void>>(
      'DELETE_TOKEN',
      async (
        _event,
        { service, account }: TokenRequest,
      ): Promise<ViewModel<void>> => {
        const tokenStorage =
          DependencyInjection.get<ITokenStorage>('tokenStorage')

        try {
          await tokenStorage.deleteToken(service, account)

          return {
            isSuccess: true,
            data: undefined,
          }
        } catch {
          return {
            isSuccess: false,
            error: 'Failed to delete the token',
            data: undefined,
          }
        }
      },
    )
  }
}
