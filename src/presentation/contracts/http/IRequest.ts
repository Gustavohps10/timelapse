export interface IRequest<TBody = void> {
  headers?: Headers
  body: TBody
}

export type Headers = {
  authorization?: string
}
