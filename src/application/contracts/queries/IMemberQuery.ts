import { MemberDTO } from '@/application/dto/MemberDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

export interface IMemberQuery {
  //   create(taskData: TaskDTO): Promise<Either<AppError, TaskDTO>>
  findMeById(id: string): Promise<Either<AppError, MemberDTO>>
  findMeByCredentials(
    login: string,
    password: string,
  ): Promise<Either<AppError, MemberDTO>>
}
