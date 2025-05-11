import { ipcRenderer } from 'electron'

import { IpcChannels } from '@/presentation/constants/IpcChannels'
import { IRequest } from '@/presentation/contracts/http'
import { WindowClient } from '@/ui/client/WindowClient'

export class IpcInvoker {
  static async invoke<Req extends IRequest<any>, Res>(
    channel: keyof typeof IpcChannels,
    payload?: Req,
  ): Promise<Res> {
    const request = payload ?? ({ body: {} } as IRequest<any>)

    const updatedRequest = WindowClient.requestInterceptor
      ? await WindowClient.requestInterceptor(request)
      : request

    return ipcRenderer.invoke(channel, updatedRequest)
  }
}
