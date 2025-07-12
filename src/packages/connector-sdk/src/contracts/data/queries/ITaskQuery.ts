import { TaskDTO } from '@trackalize/presentation/dtos'

import { IQueryBase } from '@/contracts/data/queries/IQueryBase'

export interface ITaskQuery extends IQueryBase<TaskDTO> {}
