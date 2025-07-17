export interface WorkspaceViewModel {
  id: string
  name: string
  dataSourceType: string
  pluginId: string | null
  config: string
  createdAt: Date
  updatedAt: Date
}
