import { IHttpClient } from '@/adapters/interfaces/IHttpClient'
import { ITaskRepository } from '@/application/contracts/ITaskRepository'
import { IListTasksUseCase } from '@/domain/use-cases/IListTasksUseCase'

export const InterfaceMapping = {
  IListTasksUseCase: 'IListTasksUseCase',
  IHttpClient: 'IHttpClient',
  ITaskRepository: 'ITaskRepository',
} as const

export type TYPES_INTERFACES = {
  IListTasksUseCase: IListTasksUseCase
  IHttpClient: IHttpClient
  ITaskRepository: ITaskRepository
}
