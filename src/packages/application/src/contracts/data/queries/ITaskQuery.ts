import { IQueryBase } from '@/contracts/data/queries/IQueryBase'
import { TaskDTO } from '@/dto/TaskDTO'

export interface ITaskQuery extends IQueryBase<TaskDTO> {}
