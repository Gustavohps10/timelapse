export interface WorkspaceDTO {
  id: string
  name: string
  dataSourceType: string
  pluginId?: string
  config?: string
  createdAt: Date
  updatedAt: Date
}
