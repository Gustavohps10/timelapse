export interface TaskDTO {
  id: string
  title: string
  description: string
  workspaceId: string
  isFallback: boolean
  externalId?: string
  externalType?: string
  createdAt: Date
  updatedAt: Date
}
