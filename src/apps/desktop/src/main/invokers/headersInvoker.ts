import { IHeadersClient } from '@timelapse/application'
import { IHeaders } from '@timelapse/cross-cutting/transport'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

/* eslint-disable prettier/prettier */
export const headersInvoker: IHeadersClient = {
  setDefaultHeaders: (headers: IHeaders): void => IpcInvoker.setDefaultHeaders(headers),
  getDefaultHeaders: ():  IHeaders => IpcInvoker.getDefaultHeaders()
}
