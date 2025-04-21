import { TaskDTO } from '@/application/dto/TaskDTO'
import { BaseViewModel } from '@/presentation/view-models/BaseViewModel'

export class ListTaskViewModel extends BaseViewModel<TaskDTO[]> {
  constructor(
    isSuccess: boolean,
    data?: TaskDTO[],
    error?: string,
    totalItems?: number,
    totalPages?: number,
    currentPage?: number,
  ) {
    super(isSuccess, data, error, totalItems, totalPages, currentPage)
  }
}
