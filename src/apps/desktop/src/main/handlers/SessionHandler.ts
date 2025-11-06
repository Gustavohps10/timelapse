import { IGetCurrentUserUseCase } from '@timelapse/application'
import { MemberDTO } from '@timelapse/application'
import { AppError, Either } from '@timelapse/cross-cutting/helpers'
import { IRequest } from '@timelapse/cross-cutting/transport'
import { MemberViewModel, ViewModel } from '@timelapse/presentation/view-models'

export class SessionHandler {
  constructor(private readonly getCurrentUserService: IGetCurrentUserUseCase) {}

  public async listTimeEntries(
    // NOME POSSIVELMENTE ERRADO ALTERAR
    _event: Electron.IpcMainInvokeEvent,
    {}: IRequest,
  ): Promise<ViewModel<MemberViewModel>> {
    const result: Either<AppError, MemberDTO> =
      await this.getCurrentUserService.execute()
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
