import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { MemberDTO } from '@/dto/MemberDTO'

export interface IGetCurrentUserUseCase {
  execute(): Promise<Either<AppError, MemberDTO>>
}
