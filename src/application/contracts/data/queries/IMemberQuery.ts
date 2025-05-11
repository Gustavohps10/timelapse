import { IQueryBase } from '@/application/contracts/data/queries/IQueryBase'
import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface IMemberQuery extends IQueryBase<MemberDTO> {
  findMeById(id: string): Promise<Either<AppError, MemberDTO>>
  findMeByCredentials(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>>
}
