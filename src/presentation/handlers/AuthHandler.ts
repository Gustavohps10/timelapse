import { AuthenticationDTO } from '@/application/dto/AuthenticationDTO'
import { IAuthenticationUseCase } from '@/domain/use-cases/IAuthenticationUseCase'
import { IRequest } from '@/presentation/contracts/http'
import { AuthenticationViewModel } from '@/presentation/view-models/AuthenticationViewModel'
import { ViewModel } from '@/presentation/view-models/ViewModel'

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
