export interface WorkspaceViewModel {
  id: string
  name: string
  dataSourceType: string
  pluginId?: string
  pluginConfig?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
