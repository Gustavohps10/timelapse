import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { MemberDTO } from '@trackalize/presentation/dtos'

import { IQueryBase } from '@/contracts/data/queries/IQueryBase'

export interface IMemberQuery extends IQueryBase<MemberDTO> {
  findMeById(id: string): Promise<Either<AppError, MemberDTO>>
  findMeByCredentials(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>>
}
