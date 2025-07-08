import { AppError, Either } from '@trackpoint/cross-cutting/helpers'

import { MemberDTO } from '@/dto/MemberDTO'

export interface IGetCurrentUserUseCase {
  execute(): Promise<Either<AppError, MemberDTO>>
}
