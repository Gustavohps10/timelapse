import { IAuthentication } from '@/presentation/interfaces/IAuthentication'
import { ITasks } from '@/presentation/interfaces/ITasks'
import { ITimeEntries } from '@/presentation/interfaces/ITimeEntries'

export interface IServices {
  tasks: ITasks
  auth: IAuthentication
  timeEntries: ITimeEntries
}
