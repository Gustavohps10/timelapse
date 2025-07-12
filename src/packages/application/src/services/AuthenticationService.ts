import { IAuthenticationStrategy } from '@trackalize/connector-sdk/contracts'
import { AppError, Either } from '@trackalize/cross-cutting/helpers'
import { AuthenticationDTO } from '@trackalize/presentation/dtos'
import { MemberDTO } from '@trackalize/presentation/dtos'

import { IJWTService } from '@/contracts/infra/IJWTService'
import { IAuthenticationUseCase } from '@/contracts/use-cases/IAuthenticationUseCase'

export class AuthenticationService implements IAuthenticationUseCase {
  constructor(
    private readonly authenticationStrategy: IAuthenticationStrategy,
    private readonly jwtService: IJWTService,
  ) {}

  public async execute(
    login: string,
    password: string,
  ): Promise<Either<AppError, AuthenticationDTO>> {
    const memberResult = await this.authenticationStrategy.authenticate(
      login,
      password,
    )

    if (memberResult.isFailure()) return Either.failure(memberResult.failure)

    const member: MemberDTO = memberResult.success

    const token = await this.jwtService.generateToken({
      id: member.id.toString(),
      name: member.firstname + ' ' + member.lastname,
    })

    const authenticationDTO: AuthenticationDTO = {
      member,
      token,
    }

    return Either.success(authenticationDTO)
  }
}
