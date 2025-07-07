export class AppError {
  constructor(
    public readonly messageKey: string,
    public readonly details?: string,
    public readonly statusCode: number = 500,
  ) {}

  toString(): string {
    return `[${this.messageKey}] ${this.details ?? ''}`
  }
}
