export interface IRequest<TBody> {
  headers?: Headers
  body: TBody
}

export type Headers = {
  authorization?: string
}
