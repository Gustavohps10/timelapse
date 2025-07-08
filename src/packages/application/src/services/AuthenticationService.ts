import { AppError, Either } from '@trackpoint/cross-cutting/helpers'

import { IJWTService } from '@/contracts/infra/IJWTService'
import { IAuthenticationStrategy } from '@/contracts/strategies/IAuthenticationStrategy'
import { IAuthenticationUseCase } from '@/contracts/use-cases/IAuthenticationUseCase'
import { AuthenticationDTO } from '@/dto/AuthenticationDTO'
import { MemberDTO } from '@/dto/MemberDTO'

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
