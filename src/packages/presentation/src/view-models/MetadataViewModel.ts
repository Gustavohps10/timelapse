export interface MetadataViewModel {
  taskStatuses: MetadataItem[]
  taskPriorities: MetadataItem[]
  activities: MetadataItem[]
}

export interface MetadataItem {
  id: string
  name: string
  icon: string
  colors: {
    badge: string
    background: string
    text: string
    border?: string
  }
}
