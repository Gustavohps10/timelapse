import { ElectronAPI } from '@electron-toolkit/preload'

import { WindowAPI } from '@/presentation/interfaces/WindowApi'

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowAPI
  }
}
