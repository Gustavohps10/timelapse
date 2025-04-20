import { LoginRequest, LoginResponse } from '../api/current-user.js'
import { TimeEntriesRequest, TimeEntriesResponse } from '../api/time-entries.js'

export interface Redmine {
  timeEntries: (data: TimeEntriesRequest) => Promise<TimeEntriesResponse>
  currentUser: (data: LoginRequest) => Promise<LoginResponse>
}

export interface Keytar {
  savePassword: (
    service: string,
    account: string,
    password: string,
  ) => Promise<void>
  getPassword: (service: string, account: string) => Promise<string | null>
  deletePassword: (service: string, account: string) => Promise<boolean>
}

export interface WindowAPI {
  redmine: Redmine
  keytar: Keytar
}
