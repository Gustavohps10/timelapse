import { IUnitOfWork } from '@trackalize/application/contracts'
import {
  IMemberQuery,
  ITaskQuery,
  ITimeEntryQuery,
} from '@trackalize/connector-sdk/contracts'

export class UnitOfWork implements IUnitOfWork {
  public inTransaction: boolean = false

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
