import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { MemberDTO } from '@/dtos'

export interface AuthenticationResult {
  member: MemberDTO
  credentials: Record<string, unknown>
}

export interface IAuthenticationStrategy<AuthCredentials = unknown> {
  authenticate(
    credentials: AuthCredentials,
  ): Promise<Either<AppError, AuthenticationResult>>
}
