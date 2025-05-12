import { ipcRenderer } from 'electron'

import { IpcChannels } from '@/presentation/constants/IpcChannels'
import { Headers, IRequest } from '@/presentation/contracts/http'

export class IpcInvoker {
  private static defaultHeaders: Headers = {}

  static async invoke<Req extends IRequest<any>, Res>(
    channel: keyof typeof IpcChannels,
    payload?: Req,
  ): Promise<Res> {
    const request = payload ?? ({ body: {} } as IRequest<any>)
    const updatedRequest = await this.requestInterceptor(request)

    return ipcRenderer.invoke(channel, updatedRequest)
  }

  private static async requestInterceptor(requestOptions) {
    requestOptions.headers = {
      ...this.defaultHeaders,
      ...(requestOptions.headers ?? {}),
    }
    return requestOptions
  }

  static setDefaultHeaders(headers: Headers) {
    Object.assign(this.defaultHeaders, headers)
  }

  static getDefaultHeaders() {
    return { ...this.defaultHeaders }
  }
}
