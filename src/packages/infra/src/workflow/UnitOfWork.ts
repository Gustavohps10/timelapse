import { IUnitOfWork } from '@trackalize/application'
import {
  IMemberQuery,
  ITaskQuery,
  ITimeEntryQuery,
} from '@trackalize/application'

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
