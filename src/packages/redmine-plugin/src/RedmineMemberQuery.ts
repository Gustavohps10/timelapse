import {
  AppError,
  Context,
  Either,
  IMemberQuery,
  MemberDTO,
} from '@trackalize/connector-sdk'

import { RedmineBase } from '@/RedmineBase'

interface RedmineUserAPIResponse {
  id: number
  login: string
  admin: boolean
  firstname: string
  lastname: string
  mail: string
  created_on: string
  last_login_on: string
  api_key: string
  custom_fields: {
    id: number
    name: string
    value: string
  }[]
}

interface RedmineUserResponse {
  user: RedmineUserAPIResponse
}

export class RedmineMemberQuery extends RedmineBase implements IMemberQuery {
  constructor(context: Context) {
    super(context)
  }

  findMeByCredentials(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>> {
    throw new Error('Method findMeByCredentials not implemented.')
  }

  public async findMeById(id: string): Promise<Either<AppError, MemberDTO>> {
    try {
      const client = await this.getAuthenticatedClient()
      const response = await client.get<RedmineUserResponse>(
        `/users/${id}.json`,
      )

      const redmineUser = response.data.user

      const member: MemberDTO = {
        id: redmineUser.id,
        login: redmineUser.login,
        firstname: redmineUser.firstname,
        lastname: redmineUser.lastname,
        admin: redmineUser.admin,
        created_on: redmineUser.created_on,
        last_login_on: redmineUser.last_login_on,
        api_key: redmineUser.api_key,
        custom_fields: redmineUser.custom_fields,
      }

      return Either.success(member)
    } catch {
      return Either.failure(
        new AppError(
          `Não foi possível obter o usuário do Redmine com ID: ${id}`,
          '',
          404,
        ),
      )
    }
  }

  findAll(): Promise<Either<AppError, MemberDTO[]>> {
    throw new Error(
      'Método "findAll" não implementado para o conector Redmine.',
    )
  }

  findById(id: string): Promise<Either<AppError, MemberDTO | null>> {
    throw new Error(
      'Método "findById" não implementado para o conector Redmine.',
    )
  }

  exists(criteria: Partial<MemberDTO>): Promise<Either<AppError, boolean>> {
    throw new Error('Método "exists" não implementado para o conector Redmine.')
  }
}
