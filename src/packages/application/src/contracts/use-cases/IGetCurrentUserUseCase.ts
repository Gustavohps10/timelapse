import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { MemberDTO } from '@trackalize/presentation/dtos'

export interface IGetCurrentUserUseCase {
  execute(): Promise<Either<AppError, MemberDTO>>
}
