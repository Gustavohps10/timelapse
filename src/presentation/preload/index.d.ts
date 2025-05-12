import { ElectronAPI } from '@electron-toolkit/preload'

import { IWindowAPIInvoker } from '../contracts/invokers/IWindowApiInvoker'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IWindowAPIInvoker
  }
}
