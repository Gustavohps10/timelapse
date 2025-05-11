import { ElectronAPI } from '@electron-toolkit/preload'

import { IWindowAPIInvoker } from '../contracts/invokers'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IWindowAPIInvoker
  }
}
