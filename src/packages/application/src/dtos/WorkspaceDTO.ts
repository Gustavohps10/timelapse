export interface WorkspaceDTO {
  id: string
  name: string
  dataSourceType: string
  pluginId?: string
  pluginConfig?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
