import { IAuthenticationStrategy } from '@/application/contracts/strategies/IAuthenticationStrategy'
import { AuthenticationDTO } from '@/application/dto/AuthenticationDTO'
import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'
import { IAuthenticationUseCase } from '@/domain/use-cases/IAuthenticationUseCase'

export class AuthenticationService implements IAuthenticationUseCase {
  constructor(
    private readonly authenticationStrategy: IAuthenticationStrategy,
  ) {}

  public async execute(
    email: string,
    password: string,
  ): Promise<Either<AppError, AuthenticationDTO>> {
    const memberResult = await this.authenticationStrategy.authenticate(
      email,
      password,
    )

    if (memberResult.isFailure()) return Either.failure(memberResult.failure)

    const member: MemberDTO = memberResult.success

    const authenticationDTO: AuthenticationDTO = {
      member,
      token: 'GERANDO JWT RANDOM',
    }

    return Either.success(authenticationDTO)
  }
}
