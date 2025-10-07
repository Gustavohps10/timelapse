export type SyncDocumentViewModel<T> = {
  document: T
  _deleted?: boolean
  _conflicted?: boolean
  _conflictData?: { server?: T; local: T }
  _validationError?: {
    messageKey: string
    details?: Record<string, string[]>
    statusCode: number
  }
  _syncedAt?: Date
  assumedMasterState?: T
}
