import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { AuthenticationDTO } from '@trackalize/presentation/dtos'

export interface IAuthenticationUseCase {
  execute(
    login: string,
    password: string,
  ): Promise<Either<AppError, AuthenticationDTO>>
}
