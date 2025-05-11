import { AuthenticationDTO } from '@/application/dto/AuthenticationDTO'
import { IAuthenticationUseCase } from '@/domain/use-cases/IAuthenticationUseCase'
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
    { login, password }: LoginRequest,
  ): Promise<ViewModel<AuthenticationViewModel>> {
    const result = await this.authenticationService.execute(login, password)

    if (result.isFailure()) {
      return {
        isSuccess: false,
        error: result.failure.messageKey,
        data: undefined,
      }
    }

    const { member, token, key }: AuthenticationDTO = result.success

    return {
      isSuccess: true,
      data: { member, token, key },
    }
  }
}
