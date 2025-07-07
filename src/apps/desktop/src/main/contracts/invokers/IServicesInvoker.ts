import { IAuthenticationInvoker } from '@/main/contracts/invokers/IAuthenticationInvoker'
import { ISessionInvoker } from '@/main/contracts/invokers/ISessionInvoker'
import { ITasksInvoker } from '@/main/contracts/invokers/ITasksInvoker'
import { ITimeEntriesInvoker } from '@/main/contracts/invokers/ITimeEntriesInvoker'

export interface IServicesInvoker {
  session: ISessionInvoker
  tasks: ITasksInvoker
  auth: IAuthenticationInvoker
  timeEntries: ITimeEntriesInvoker
}
