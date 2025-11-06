export interface WorkspaceDTO {
  id: string
  name: string
  dataSource: string
  dataSourceConfiguration?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
