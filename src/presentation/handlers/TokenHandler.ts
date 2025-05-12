import { ITokenStorage } from '@/application/contracts/storage/ITokenStorage'
import { IRequest } from '@/presentation/contracts/http'
import { ViewModel } from '@/presentation/view-models/ViewModel'

export interface TokenRequest {
  service: string
  account: string
  token?: string
}

export class TokenHandler {
  constructor(private readonly tokenStorage: ITokenStorage) {}

  public async saveToken(
    _event: Electron.IpcMainInvokeEvent,
    { body: { service, account, token } }: IRequest<TokenRequest>,
  ): Promise<ViewModel<void>> {
    try {
      if (!token) {
        return {
          isSuccess: false,
          error: 'Token is required',
          data: undefined,
        }
      }

      await this.tokenStorage.saveToken(service, account, token)

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
  }

  public async getToken(
    _event: Electron.IpcMainInvokeEvent,
    { service, account }: TokenRequest,
  ): Promise<ViewModel<string | null>> {
    try {
      const token = await this.tokenStorage.getToken(service, account)

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
  }

  public async deleteToken(
    _event: Electron.IpcMainInvokeEvent,
    { service, account }: TokenRequest,
  ): Promise<ViewModel<void>> {
    try {
      await this.tokenStorage.deleteToken(service, account)

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
  }
}
