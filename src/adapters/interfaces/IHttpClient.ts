import { AxiosRequestConfig } from 'axios'

import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface IHttpClient {
  configure(config: { baseURL: string; params?: Record<string, string> }): void
  get<T>(url: string, config?: AxiosRequestConfig): Promise<Either<AppError, T>>
  post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>>
  put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>>
  patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>>
  delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>>
}
