import { IJWTService, Payload } from '@trackpoint/application/contracts'
import jwt from 'jsonwebtoken'

export class JwtService implements IJWTService {
  private readonly secret: string

  constructor() {
    // Alterar futuramente
    this.secret = process.env.JWT_SECRET || 'default_secret_TROCAR_FUTURAMENTE'
  }

  public generateToken(payload: Payload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '1h' })
  }

  public tokenIsValid(token: string): boolean {
    try {
      jwt.verify(token, this.secret)
      return true
    } catch {
      return false
    }
  }

  public decodeToken(token: string): Payload | undefined {
    return jwt.decode(token) as Payload | undefined
  }
}
