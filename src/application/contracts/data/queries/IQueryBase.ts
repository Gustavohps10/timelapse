import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface IQueryBase<T> {
  findAll(): Promise<Either<AppError, T[]>>
  findById(id: string): Promise<Either<AppError, T | null>>
  // findOne(criteria: Partial<T>): Promise<Either<AppError, T | null>>
  // findMany(criteria: Partial<T>): Promise<Either<AppError, T[]>>
  exists(criteria: Partial<T>): Promise<Either<AppError, boolean>>
}
