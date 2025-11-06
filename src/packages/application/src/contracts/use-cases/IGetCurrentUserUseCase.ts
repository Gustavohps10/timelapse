import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { MemberDTO } from '@/dtos'

export interface IGetCurrentUserUseCase {
  execute(): Promise<Either<AppError, MemberDTO>>
}
