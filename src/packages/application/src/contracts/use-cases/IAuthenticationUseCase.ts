import { AppError, Either } from '@trackpoint/cross-cutting/helpers'

import { AuthenticationDTO } from '@/dto/AuthenticationDTO'

export interface IAuthenticationUseCase {
  execute(
    login: string,
    password: string,
  ): Promise<Either<AppError, AuthenticationDTO>>
}
