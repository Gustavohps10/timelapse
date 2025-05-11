import { IQueryBase } from '@/application/contracts/data/queries/IQueryBase'
import { TaskDTO } from '@/application/dto/TaskDTO'

export interface ITaskQuery extends IQueryBase<TaskDTO> {
  //   vazio, por enquanto
  // findAll(): Promise<Either<AppError, TaskDTO[]>>
}
