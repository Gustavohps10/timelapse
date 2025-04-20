export class Either<Failure, Success> {
  private constructor(
    private readonly _failure: Failure | null,
    private readonly _success: Success | null,
  ) {}

  // ========= Failure Factory Methods =========
  static success<Success>(value: Success): Either<null, Success> {
    return new Either(null, value)
  }

  static failure<Failure>(value: Failure): Either<Failure, null> {
    return new Either(value, null)
  }

  // ========= Succes Status Checkers =========
  isFailure(): boolean {
    return this._failure !== null
  }

  isSuccess(): boolean {
    return this._success !== null
  }

  // ========= Value Getters =========
  get failure(): Failure {
    if (!this.isFailure()) throw new Error('No failure value')
    return this._failure!
  }

  get success(): Success {
    if (!this.isSuccess()) throw new Error('No success value')
    return this._success!
  }

  // ========= Transformations =========
  map<U>(fn: (s: Success) => U): Either<Failure, U> {
    return this.isSuccess()
      ? new Either<Failure, U>(null, fn(this.success))
      : new Either<Failure, U>(this.failure, null)
  }

  flatMap<U>(fn: (s: Success) => Either<Failure, U>): Either<Failure, U> {
    return this.isSuccess()
      ? fn(this.success)
      : new Either<Failure, U>(this.failure, null)
  }

  getOrElse(defaultValue: Success): Success {
    return this.isSuccess() ? this.success : defaultValue
  }

  unwrap(): Failure | Success {
    return this.isSuccess() ? this.success : this.failure
  }
}
