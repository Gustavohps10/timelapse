import { IAuthentication } from '@/presentation/interfaces/IAuthentication'
import { ITasks } from '@/presentation/interfaces/ITasks'

export interface IServices {
  tasks: ITasks
  auth: IAuthentication
}
