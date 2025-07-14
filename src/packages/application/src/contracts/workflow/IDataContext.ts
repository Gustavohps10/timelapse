import { IMutationBase, IQueryBase } from '@/contracts/data'

export interface IDataContext {
  beginTransaction(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
  getQuery<T>(entity: new () => T): IQueryBase<T>
  getMutation<T>(entity: new () => T): IMutationBase<T>
}
