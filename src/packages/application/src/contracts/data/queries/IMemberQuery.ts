import { AppError, Either } from '@trackpoint/cross-cutting'

import { IQueryBase } from '@/contracts/data/queries/IQueryBase'
import { MemberDTO } from '@/dto/MemberDTO'

export interface IMemberQuery extends IQueryBase<MemberDTO> {
  findMeById(id: string): Promise<Either<AppError, MemberDTO>>
  findMeByCredentials(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>>
}
