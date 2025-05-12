import { IAuthenticationStrategy } from '@/application/contracts/strategies/IAuthenticationStrategy'
import { AuthenticationDTO } from '@/application/dto/AuthenticationDTO'
import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IAuthenticationUseCase } from '@/domain/use-cases/IAuthenticationUseCase'
import { IJWTService } from '@/presentation/contracts/IJWTService'

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
