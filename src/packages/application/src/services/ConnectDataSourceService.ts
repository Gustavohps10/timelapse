import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import {
  ConnectDataSourceInput,
  IAuthenticationStrategy,
  IConnectDataSourceUseCase,
  ICredentialsStorage,
  IJWTService,
  IWorkspacesRepository,
} from '@/contracts'
import { AuthenticationDTO } from '@/dtos'

export class ConnectDataSourceService implements IConnectDataSourceUseCase {
  constructor(
    private readonly authenticationStrategy: IAuthenticationStrategy<any>,
    private readonly jwtService: IJWTService,
    private readonly credentialsStorage: ICredentialsStorage,
    private readonly workspacesRepository: IWorkspacesRepository,
  ) {}

  public async execute<
    Credentials,
    Configuration extends Record<string, unknown>,
  >(
    input: ConnectDataSourceInput<Credentials, Configuration>,
  ): Promise<Either<AppError, AuthenticationDTO>> {
    const workspace = await this.workspacesRepository.findById(
      input.workspaceId,
    )
    if (!workspace) {
      return Either.failure(new AppError('Workspace não encontrado'))
    }

    const authResult = await this.authenticationStrategy.authenticate({
      configuration: input.configuration,
      credentials: input.credentials,
    })
    if (authResult.isFailure()) {
      return authResult.forwardFailure()
    }

    const { member, credentials } = authResult.success
    const serializedCredentials = JSON.stringify(credentials)
    const storageKey = `workspace-session-${input.workspaceId}`

    try {
      await this.credentialsStorage.saveToken(
        'timelapse',
        storageKey,
        serializedCredentials,
      )

      const connectResult = workspace.connectDataSource(input.configuration)

      if (connectResult.isFailure()) {
        throw new Error(connectResult.failure.messageKey)
      }

      await this.workspacesRepository.update(workspace)

      const token = await this.jwtService.generateToken({
        id: member.id.toString(),
        name: `${member.firstname} ${member.lastname}`,
        workspaceId: input.workspaceId,
      })

      return Either.success<AuthenticationDTO>({ member, token })
    } catch (error) {
      await this.credentialsStorage.deleteToken('timelapse', storageKey)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao conectar a fonte de dados.'
      return Either.failure(new AppError(errorMessage))
    }
  }
}
