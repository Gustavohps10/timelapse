export interface TaskDTO {
  id: string
  title: string
  description?: string
  url?: string
  projectName?: string
  status: {
    id: string
    name: string
  }
  priority?: {
    id: string
    name: string
  }
  assignedTo?: {
    id: string
    name: string
  }
  author?: {
    id: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
  startDate?: Date
  dueDate?: Date
  doneRatio?: number
  estimatedTime?: {
    production?: number
    validation?: number
    documentation?: number
    generic?: number
  }
  spentHours?: number
  statusChanges?: StatusChangeDTO[]
}

export interface StatusChangeDTO {
  fromStatus: string
  toStatus: string
  changedBy: string
  changedAt: Date
}
