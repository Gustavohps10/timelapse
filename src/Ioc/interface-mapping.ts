import { ITaskRepository } from '@/application/contracts/ITaskRepository'
import { IListTasksUseCase } from '@/domain/use-cases/IListTasksUseCase'

export interface TYPES_INTERFACES {
  IListTasksUseCase: IListTasksUseCase
  ITaskRepository: ITaskRepository
}

export const InterfaceMapping = Object.fromEntries(
  Object.keys({} as TYPES_INTERFACES).map((name) => [name, Symbol.for(name)]),
) as Record<keyof TYPES_INTERFACES, symbol>
