import { ElectronAPI } from '@electron-toolkit/preload'
import type { IApplicationAPI } from '@timelapse/application'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApplicationAPI
  }
}
