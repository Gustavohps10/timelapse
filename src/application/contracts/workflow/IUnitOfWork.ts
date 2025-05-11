import { IMemberQuery } from '@/application/contracts/data/queries/IMemberQuery'
import { ITaskQuery } from '@/application/contracts/data/queries/ITaskQuery'
import { ITimeEntryQuery } from '@/application/contracts/data/queries/ITimeEntryQuery'
import { ISessionUser } from '@/application/contracts/workflow/ISessionUser'

export interface IUnitOfWork {
  beginTransaction(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>

  inTransaction: boolean
  sessionUser?: ISessionUser

  memberQuery: IMemberQuery
  taskQuery: ITaskQuery
  timeEntryQuery: ITimeEntryQuery
}
