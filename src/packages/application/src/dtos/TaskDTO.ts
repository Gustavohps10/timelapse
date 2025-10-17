export interface TaskDTO {
  id: string
  url: string
  title: string
  status: {
    id: string
    name: string
  }
  assignedTo?: {
    id: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
  estimatedTime: {
    production?: number
    validation?: number
    documentation?: number
  }
  statusChanges?: StatusChangeDTO[]
}

export interface StatusChangeDTO {
  fromStatus: string
  toStatus: string
  changedBy: string
  changedAt: Date
}
