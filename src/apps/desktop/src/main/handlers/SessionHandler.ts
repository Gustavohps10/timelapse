import { IGetCurrentUserUseCase } from '@trackalize/application'
import { MemberDTO } from '@trackalize/application'
import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { IRequest } from '@trackalize/cross-cutting/transport'
import {
  MemberViewModel,
  ViewModel,
} from '@trackalize/presentation/view-models'

export class SessionHandler {
  constructor(private readonly getCurrentUserService: IGetCurrentUserUseCase) {}

  public async listTimeEntries(
    // NOME POSSIVELMENTE ERRADO ALTERAR
    _event: Electron.IpcMainInvokeEvent,
    {}: IRequest,
  ): Promise<ViewModel<MemberViewModel>> {
    const result: Either<AppError, MemberDTO> =
      await this.getCurrentUserService.execute()
    console.log('BACKEND')
    console.log(result)

    if (result.isFailure()) {
      return {
        statusCode: 500,
        isSuccess: false,
        error: 'Falha ao encontrar usuario da sessao',
      }
    }

    const member: MemberViewModel = result.success

    return {
      statusCode: 200,
      isSuccess: true,
      data: member,
    }
  }
}
