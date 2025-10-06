export type SyncDocumentDTO<T> = {
  document: T
  _deleted?: boolean
  _conflicted?: boolean
  _conflictData?: { server?: T; local: T }
  _syncedAt?: Date
  assumedMasterState?: T
}
