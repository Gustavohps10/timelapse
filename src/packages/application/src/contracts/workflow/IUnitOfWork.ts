import { IMemberQuery } from '@/contracts/data/queries/IMemberQuery'
import { ITaskQuery } from '@/contracts/data/queries/ITaskQuery'
import { ITimeEntryQuery } from '@/contracts/data/queries/ITimeEntryQuery'

export interface IUnitOfWork {
  beginTransaction(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>

  inTransaction: boolean

  memberQuery: IMemberQuery
  taskQuery: ITaskQuery
  timeEntryQuery: ITimeEntryQuery
}
