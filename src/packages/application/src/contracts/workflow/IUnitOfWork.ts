import {
  IMemberQuery,
  ITaskQuery,
  ITimeEntryQuery,
  IWorkspacesRepository,
} from '@/contracts'

export interface IUnitOfWork {
  beginTransaction(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>

  inTransaction: boolean

  memberQuery: IMemberQuery
  taskQuery: ITaskQuery
  timeEntryQuery: ITimeEntryQuery
  workspacesRepository: IWorkspacesRepository
}
