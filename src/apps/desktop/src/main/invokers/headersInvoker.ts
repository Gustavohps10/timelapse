import { IHeaders } from '@trackalize/cross-cutting/transport'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { IHeadersInvoker } from '@/main/contracts/invokers'

/* eslint-disable prettier/prettier */
export const headersInvoker: IHeadersInvoker = {
  setDefaultHeaders: (headers: IHeaders): void => IpcInvoker.setDefaultHeaders(headers),
  getDefaultHeaders: ():  IHeaders => IpcInvoker.getDefaultHeaders()
}
