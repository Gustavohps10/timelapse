import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { AuthenticationDTO } from '@/dtos'

interface ExecuteParams<AuthCredentials> {
  workspaceId: string
  credentials: AuthCredentials
}

export interface IAuthenticationUseCase {
  execute<AuthCredentials>(
    params: ExecuteParams<AuthCredentials>,
  ): Promise<Either<AppError, AuthenticationDTO>>
}
