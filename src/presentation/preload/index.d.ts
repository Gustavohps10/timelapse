import { ElectronAPI } from '@electron-toolkit/preload'

import { WindowAPI } from '../types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowAPI
  }
}
