import { IRequest } from '@timelapse/cross-cutting/transport'
import { ViewModel } from '@timelapse/presentation/view-models'

export interface ITokenStorageInvoker {
  saveToken(
    request: IRequest<{
      service: string
      account: string
      token: string
    }>,
  ): Promise<ViewModel<void>>

  getToken(
    request: IRequest<{
      service: string
      account: string
    }>,
  ): Promise<ViewModel<string | null>>

  deleteToken(
    request: IRequest<{
      service: string
      account: string
    }>,
  ): Promise<ViewModel<void>>
}
