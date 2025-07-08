import { IGetCurrentUserUseCase } from '@trackpoint/application/contracts'
import { MemberDTO } from '@trackpoint/application/dto'
import { AppError, Either } from '@trackpoint/cross-cutting/helpers'
import { IRequest } from '@trackpoint/cross-cutting/transport'
import {
  MemberViewModel,
  ViewModel,
} from '@trackpoint/presentation/view-models'

export class SessionHandler {
  constructor(private readonly getCurrentUserService: IGetCurrentUserUseCase) {}

  public async listTimeEntries(
    _event: Electron.IpcMainInvokeEvent,
    {}: IRequest,
  ): Promise<ViewModel<MemberViewModel>> {
    console.log('BACKEND')
    const result: Either<AppError, MemberDTO> =
      await this.getCurrentUserService.execute()

    if (result.isFailure()) {
      return {
        statusCode: 500,
        isSuccess: false,
        error: 'Erro ao listar tarefas',
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
