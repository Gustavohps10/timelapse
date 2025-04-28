import { ElectronAPI } from '@electron-toolkit/preload'

import { IWindowAPI } from '../interfaces'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IWindowAPI
  }
}
