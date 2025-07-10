import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { MemberDTO } from '@/dto/MemberDTO'

export interface IAuthenticationStrategy {
  authenticate(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>>
}
