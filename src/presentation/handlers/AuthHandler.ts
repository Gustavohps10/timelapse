import { DependencyInjection } from '@Ioc/DependencyInjection'

import { AuthenticationDTO } from '@/application/dto/AuthenticationDTO'
import { IAuthenticationUseCase } from '@/domain/use-cases/IAuthenticationUseCase'
import { IpcHandler } from '@/presentation/adapters/ipcHandler'
import { AuthenticationViewModel } from '@/presentation/view-models/AuthenticationViewModel'
import { ViewModel } from '@/presentation/view-models/ViewModel'

export interface LoginRequest {
  login: string
  password: string
}

export class AuthHandler {
  static register(): void {
    IpcHandler.handle<ViewModel<AuthenticationViewModel>>(
      'LOGIN',
      async (
        _event,
        { login, password }: LoginRequest,
      ): Promise<ViewModel<AuthenticationViewModel>> => {
        const authenticationService =
          DependencyInjection.get<IAuthenticationUseCase>(
            'authenticationService',
          )

        const result = await authenticationService.execute(login, password)

        if (result.isFailure()) {
          return {
            isSuccess: false,
            error: result.failure.messageKey,
            data: undefined,
          }
        }

        const { member, token, key }: AuthenticationDTO = result.success
        const authenticationViewModel: AuthenticationViewModel = {
          member,
          token,
          key,
        }

        return {
          isSuccess: result.isSuccess(),
          data: authenticationViewModel,
        }
      },
    )
  }
}
