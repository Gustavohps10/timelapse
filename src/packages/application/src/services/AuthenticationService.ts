import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import {
  IAuthenticationStrategy,
  IAuthenticationUseCase,
  ICredentialsStorage,
  IJWTService,
} from '@/contracts'
import { AuthenticationDTO } from '@/dtos'

interface ExecuteParams<AuthCredentials> {
  workspaceId: string
  credentials: AuthCredentials
}

export class AuthenticationService implements IAuthenticationUseCase {
  constructor(
    private readonly authenticationStrategy: IAuthenticationStrategy<any>,
    private readonly jwtService: IJWTService,
    private readonly credentialsStorage: ICredentialsStorage,
  ) {}

  public async execute<AuthCredentials>(
    params: ExecuteParams<AuthCredentials>,
  ): Promise<Either<AppError, AuthenticationDTO>> {
    const authenticationResult = await this.authenticationStrategy.authenticate(
      params.credentials,
    )

    if (authenticationResult.isFailure()) {
      return Either.failure(authenticationResult.failure)
    }

    const { member, sessionDataToStore } = authenticationResult.success

    await this.credentialsStorage.saveToken(
      'trackalize',
      `workspace-session-${params.workspaceId}`,
      sessionDataToStore,
    )

    const token = await this.jwtService.generateToken({
      id: member.id.toString(),
      name: `${member.firstname} ${member.lastname}`,
      workspaceId: params.workspaceId,
    })

    const authenticationDTO: AuthenticationDTO = {
      member,
      token,
    }

    return Either.success(authenticationDTO)
  }
}
