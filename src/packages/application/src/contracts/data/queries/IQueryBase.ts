import { AppError, Either } from '@trackalize/cross-cutting/helpers'

export interface IQueryBase<T> {
  findAll(): Promise<Either<AppError, T[]>>
  findById(id: string): Promise<Either<AppError, T | null>>
  exists(criteria: Partial<T>): Promise<Either<AppError, boolean>>
}
