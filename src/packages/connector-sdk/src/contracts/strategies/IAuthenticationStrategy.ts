import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { MemberDTO } from '@trackalize/presentation/dtos'

export interface IAuthenticationStrategy {
  authenticate(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>>
}
