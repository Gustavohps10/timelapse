import { IAuthenticationUseCase } from '@trackalize/application/contracts'
import { AuthenticationDTO } from '@trackalize/application/dto'
import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  AuthenticationViewModel,
  ViewModel,
} from '@trackalize/presentation/view-models'

export interface LoginRequest {
  login: string
  password: string
}

export class AuthHandler {
  constructor(private readonly authenticationService: IAuthenticationUseCase) {}

  public async login(
    _event: Electron.IpcMainInvokeEvent,
    { body: { login, password } }: IRequest<LoginRequest>,
  ): Promise<ViewModel<AuthenticationViewModel>> {
    const result = await this.authenticationService.execute(login, password)

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
