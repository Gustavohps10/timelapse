import { IHeaders } from '@trackalize/cross-cutting/transport'

export interface IHeadersInvoker {
  setDefaultHeaders(headers: IHeaders): void
  getDefaultHeaders(): IHeaders
}
