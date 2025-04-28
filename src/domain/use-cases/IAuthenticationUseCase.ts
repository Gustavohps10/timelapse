import { AuthenticationDTO } from '@/application/dto/AuthenticationDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface IAuthenticationUseCase {
  execute(
    login: string,
    password: string,
  ): Promise<Either<AppError, AuthenticationDTO>>
}
