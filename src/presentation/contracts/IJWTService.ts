export interface Payload {
  id: string
  name: string
}

export interface IJWTService {
  generateToken(payload: Payload): string
  tokenIsValid(token: string): boolean
  decodeToken(token: string): Payload | undefined
}
