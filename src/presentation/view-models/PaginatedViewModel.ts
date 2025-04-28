import { ViewModel } from '@/presentation/view-models/ViewModel'

export interface PaginatedViewModel<Data> extends ViewModel<Data> {
  totalItems: number
  totalPages: number
  currentPage: number
}
