import { IAuthenticationInvoker } from '@/presentation/contracts/invokers/IAuthenticationInvoker'
import { ISessionInvoker } from '@/presentation/contracts/invokers/ISessionInvoker'
import { ITasksInvoker } from '@/presentation/contracts/invokers/ITasksInvoker'
import { ITimeEntriesInvoker } from '@/presentation/contracts/invokers/ITimeEntriesInvoker'

export interface IServicesInvoker {
  session: ISessionInvoker
  tasks: ITasksInvoker
  auth: IAuthenticationInvoker
  timeEntries: ITimeEntriesInvoker
}
