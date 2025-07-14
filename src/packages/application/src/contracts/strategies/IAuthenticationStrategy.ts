import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { MemberDTO } from '@/dtos'

export interface AuthenticationResult {
  member: MemberDTO
  sessionDataToStore: string
}

export interface IAuthenticationStrategy<AuthCredentials = unknown> {
  authenticate(
    credentials: AuthCredentials,
  ): Promise<Either<AppError, AuthenticationResult>>
}
