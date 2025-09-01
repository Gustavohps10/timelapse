import { AppError, Either } from '@trackalize/cross-cutting/helpers'

import { AuthenticationDTO } from '@/dtos'

export interface ConnectDataSourceInput<Credentials, Configuration> {
  workspaceId: string
  credentials: Credentials
  configuration: Configuration
}

export interface IConnectDataSourceUseCase {
  execute<Credentials, Configuration extends Record<string, unknown>>(
    input: ConnectDataSourceInput<Credentials, Configuration>,
  ): Promise<Either<AppError, AuthenticationDTO>>
}
