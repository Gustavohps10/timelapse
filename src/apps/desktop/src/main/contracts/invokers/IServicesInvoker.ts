import { ISessionInvoker } from '@/main/contracts/invokers/ISessionInvoker'
import { ITasksInvoker } from '@/main/contracts/invokers/ITasksInvoker'
import { ITimeEntriesInvoker } from '@/main/contracts/invokers/ITimeEntriesInvoker'
import { IWorkspacesInvoker } from '@/main/contracts/invokers/IWorkspacesInvoker'

export interface IServicesInvoker {
  workspaces: IWorkspacesInvoker
  session: ISessionInvoker
  tasks: ITasksInvoker
  timeEntries: ITimeEntriesInvoker
}
