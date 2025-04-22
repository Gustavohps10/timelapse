import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

import { IHttpClient } from '@/adapters/interfaces/IHttpClient'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export class HttpClient implements IHttpClient {
  private axiosInstance!: AxiosInstance

  configure(baseURL: string): void {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
    })
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>> {
    try {
      const { data } = await this.axiosInstance.get<T>(url, config)
      return Either.success(data)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config)
      return Either.success(response.data)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config)
      return Either.success(response.data)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config)
      return Either.success(response.data)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config)
      return Either.success(response.data)
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError(error: unknown): Either<AppError, never> {
    if (error instanceof AxiosError) {
      const appError = new AppError(
        error.message,
        undefined,
        error.response?.status || 500,
      )
      return Either.failure(appError)
    }

    const appError = new AppError('An unknown error occurred', undefined, 500)
    return Either.failure(appError)
  }
}
