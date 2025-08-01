import { IAuthenticationUseCase } from '@trackalize/application'
import { AuthenticationDTO } from '@trackalize/application'
import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  AuthenticationViewModel,
  ViewModel,
} from '@trackalize/presentation/view-models'

export interface LoginRequest<AuthCredentials> {
  workspaceId: string
  credentials: AuthCredentials
}

export class AuthHandler {
  constructor(private readonly authenticationService: IAuthenticationUseCase) {}

  public async login<T>(
    _event: Electron.IpcMainInvokeEvent,
    { body }: IRequest<LoginRequest<T>>,
  ): Promise<ViewModel<AuthenticationViewModel>> {
    const result = await this.authenticationService.execute(body)

    if (result.isFailure()) {
      return {
        statusCode: result.failure.statusCode,
        isSuccess: false,
        error: result.failure.messageKey,
        data: undefined,
      }
    }

    const { member, token }: AuthenticationDTO = result.success

    return {
      statusCode: 200,
      isSuccess: true,
      data: { member, token },
    }
  }
}
