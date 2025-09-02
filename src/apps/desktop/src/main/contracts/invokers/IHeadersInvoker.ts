import { IHeaders } from '@timelapse/cross-cutting/transport'

export interface IHeadersInvoker {
  setDefaultHeaders(headers: IHeaders): void
  getDefaultHeaders(): IHeaders
}
