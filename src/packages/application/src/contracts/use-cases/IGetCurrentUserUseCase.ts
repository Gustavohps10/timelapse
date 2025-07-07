import { AppError, Either } from '@trackpoint/cross-cutting'

import { MemberDTO } from '@/dto/MemberDTO'

export interface IGetCurrentUserUseCase {
  execute(): Promise<Either<AppError, MemberDTO>>
}
