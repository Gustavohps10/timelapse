import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface IAuthenticationStrategy {
  authenticate(
    email: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>>
}
