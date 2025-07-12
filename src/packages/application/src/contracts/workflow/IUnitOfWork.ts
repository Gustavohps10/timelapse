import {
  IMemberQuery,
  ITaskQuery,
  ITimeEntryQuery,
} from '@trackalize/connector-sdk/contracts'

export interface IUnitOfWork {
  beginTransaction(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>

  inTransaction: boolean

  memberQuery: IMemberQuery
  taskQuery: ITaskQuery
  timeEntryQuery: ITimeEntryQuery
}
