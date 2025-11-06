import { IUnitOfWork, IWorkspacesRepository } from '@timelapse/application'
import {
  IMemberQuery,
  ITaskQuery,
  ITimeEntryQuery,
} from '@timelapse/application'

export class UnitOfWork implements IUnitOfWork {
  public inTransaction: boolean = false

  constructor(
    public readonly memberQuery: IMemberQuery,
    public readonly taskQuery: ITaskQuery,
    public readonly timeEntryQuery: ITimeEntryQuery,
    public readonly workspacesRepository: IWorkspacesRepository,
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
