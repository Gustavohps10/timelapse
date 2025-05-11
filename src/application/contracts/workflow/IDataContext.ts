import { IMutationBase } from '@/application/contracts/data/mutations/IMutationBase'
import { IQueryBase } from '@/application/contracts/data/queries/IQueryBase'

export interface IDataContext {
  beginTransaction(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
  getQuery<T>(entity: new () => T): IQueryBase<T>
  getMutation<T>(entity: new () => T): IMutationBase<T>
}
