import { AppError } from '@timelapse/cross-cutting/helpers'

export type SyncDocumentDTO<T> = {
  document: T
  _deleted?: boolean
  _conflicted?: boolean
  _conflictData?: { server?: T; local: T }
  _validationError?: AppError
  _syncedAt?: Date
  assumedMasterState?: T
}
