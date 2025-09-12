import { ElectronAPI } from '@electron-toolkit/preload'

import type { IApplicationClient } from '@timelapse/application'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApplicationClient
  }
}
