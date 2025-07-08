import { AppError, Either } from '@trackpoint/cross-cutting/helpers'

import { MemberDTO } from '@/dto/MemberDTO'

export interface IAuthenticationStrategy {
  authenticate(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>>
}
