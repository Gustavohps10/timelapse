import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IGetCurrentUserUseCase } from '@/domain/use-cases/IGetCurrentUserUseCase'
import { IRequest } from '@/presentation/contracts/http'
import { MemberViewModel } from '@/presentation/view-models/MemberViewModel'
import { ViewModel } from '@/presentation/view-models/ViewModel'

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
