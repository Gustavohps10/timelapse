export class BaseViewModel<T> {
  public isSuccess: boolean
  public data?: T
  public error?: string
  public totalItems?: number
  public totalPages?: number
  public currentPage?: number

  constructor(
    isSuccess: boolean,
    data?: T,
    error?: string,
    totalItems?: number,
    totalPages?: number,
    currentPage?: number,
  ) {
    this.isSuccess = isSuccess
    this.data = data
    this.error = error
    this.totalItems = totalItems
    this.totalPages = totalPages
    this.currentPage = currentPage
  }
}
