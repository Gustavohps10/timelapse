export type AppErrorType = 'danger' | 'warning'

export abstract class AppError {
  constructor(
    public readonly messageKey: string,
    public readonly details?: Record<string, string[]>,
    public readonly statusCode: number = 500,
    public readonly type: AppErrorType = 'danger',
  ) {}

  static danger<T extends AppError>(
    this: new (
      messageKey: string,
      details?: Record<string, string[]>,
      type?: AppErrorType,
    ) => T,
    messageKey: string,
    details?: Record<string, string[]>,
  ): T {
    return new this(messageKey, details, 'danger')
  }

  static warning<T extends AppError>(
    this: new (
      messageKey: string,
      details?: Record<string, string[]>,
      type?: AppErrorType,
    ) => T,
    messageKey: string,
    details?: Record<string, string[]>,
  ): T {
    return new this(messageKey, details, 'warning')
  }
}

export class NotFoundError extends AppError {
  constructor(
    messageKey: string,
    details?: Record<string, string[]>,
    type: AppErrorType = 'danger',
  ) {
    super(messageKey, details, 404, type)
  }
}

export class ValidationError extends AppError {
  constructor(
    messageKey: string,
    details?: Record<string, string[]>,
    type: AppErrorType = 'danger',
  ) {
    super(messageKey, details, 422, type)
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    messageKey: string,
    details?: Record<string, string[]>,
    type: AppErrorType = 'danger',
  ) {
    super(messageKey, details, 401, type)
  }
}

export class InternalServerError extends AppError {
  constructor(
    messageKey: string,
    details?: Record<string, string[]>,
    type: AppErrorType = 'danger',
  ) {
    super(messageKey, details, 500, type)
  }
}
