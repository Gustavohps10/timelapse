import { contextBridge } from 'electron'
import {
  CurrentUser,
  SignInRequest,
  SignInResponse,
} from '../api/current-user.js'
import { WindowAPI } from '@/main/types/window-api.js'

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowAPI
  }
}
