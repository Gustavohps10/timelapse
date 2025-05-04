import { ElectronAPI } from '@electron-toolkit/preload'

import { IWindowAPI } from '@/presentation/interfaces/IWindowApi'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IWindowAPI
  }
}
