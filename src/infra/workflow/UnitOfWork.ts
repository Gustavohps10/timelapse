import { IMemberQuery } from '@/application/contracts/data/queries/IMemberQuery'
import { ITaskQuery } from '@/application/contracts/data/queries/ITaskQuery'
import { ITimeEntryQuery } from '@/application/contracts/data/queries/ITimeEntryQuery'
import { ISessionUser } from '@/application/contracts/workflow/ISessionUser'
import { IUnitOfWork } from '@/application/contracts/workflow/IUnitOfWork'

export class UnitOfWork implements IUnitOfWork {
  public inTransaction: boolean = false
  public sessionUser?: ISessionUser

  constructor(
    public readonly memberQuery: IMemberQuery,
    public readonly taskQuery: ITaskQuery,
    public readonly timeEntryQuery: ITimeEntryQuery,
  ) {}

  public async beginTransaction(): Promise<void> {
    this.inTransaction = true
  }

  public async commit(): Promise<void> {
    this.inTransaction = false
  }

  public async rollback(): Promise<void> {
    this.inTransaction = false
  }
}
