import { ElectronAPI } from '@electron-toolkit/preload'

import { WindowAPI } from '../main/types/window-api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowAPI
  }
}
