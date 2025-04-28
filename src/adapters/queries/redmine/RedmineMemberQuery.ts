import { IHttpClient } from '@/adapters/interfaces/IHttpClient'
import { IMemberQuery } from '@/application/contracts/queries/IMemberQuery'
import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export class RedmineMemberQuery implements IMemberQuery {
  constructor(private readonly httpClient: IHttpClient) {}

  public async findMeById(id: string): Promise<Either<AppError, MemberDTO>> {
    throw new Error('Method not implemented.')
  }
  public async findMeByCredentials(
    email: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>> {
    return await this.httpClient.get<MemberDTO>('/users/current-user.json')
  }
}
