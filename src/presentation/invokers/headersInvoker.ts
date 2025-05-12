import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { Headers } from '@/presentation/contracts/http'
import { IHeadersInvoker } from '@/presentation/contracts/invokers/IHeadersInvoker'

/* eslint-disable prettier/prettier */
export const headersInvoker: IHeadersInvoker = {
  setDefaultHeaders: (headers: Headers): void => IpcInvoker.setDefaultHeaders(headers),
  getDefaultHeaders: ():  Headers => IpcInvoker.getDefaultHeaders()
}
