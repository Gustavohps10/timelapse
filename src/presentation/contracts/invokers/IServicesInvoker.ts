import { IAuthenticationInvoker } from '@/presentation/contracts/invokers/IAuthenticationInvoker'
import { ITasksInvoker } from '@/presentation/contracts/invokers/ITasksInvoker'
import { ITimeEntriesInvoker } from '@/presentation/contracts/invokers/ITimeEntriesInvoker'

export interface IServicesInvoker {
  tasks: ITasksInvoker
  auth: IAuthenticationInvoker
  timeEntries: ITimeEntriesInvoker
}
