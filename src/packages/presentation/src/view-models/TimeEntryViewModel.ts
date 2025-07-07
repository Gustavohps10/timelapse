export interface TimeEntryViewModel {
  id?: number
  project?: {
    id?: number
    name?: string
  }
  issue?: {
    id?: number
  }
  user?: {
    id?: number
    name?: string
  }
  activity?: {
    id?: number
    name?: string
  }
  hours?: number
  comments?: string
  spentOn?: Date
  createdAt?: Date
  updatedAt?: Date
}
