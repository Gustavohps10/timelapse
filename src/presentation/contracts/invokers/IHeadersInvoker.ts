import { Headers } from '@/presentation/contracts/http'

export interface IHeadersInvoker {
  setDefaultHeaders(headers: Headers): void
  getDefaultHeaders(): Headers
}
