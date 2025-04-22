import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface IHttpClient {
  configure(baseURL: string): void
  get<T>(url: string, config?: any): Promise<Either<AppError, T>>
  post<T>(url: string, data?: any, config?: any): Promise<Either<AppError, T>>
  put<T>(url: string, data?: any, config?: any): Promise<Either<AppError, T>>
  patch<T>(url: string, data?: any, config?: any): Promise<Either<AppError, T>>
  delete<T>(url: string, config?: any): Promise<Either<AppError, T>>
}
