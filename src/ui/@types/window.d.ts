import { ElectronAPI } from '@electron-toolkit/preload'

import { IWindowAPIInvoker } from '@/presentation/contracts/invokers/IWindowApiInvoker'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IWindowAPIInvoker
  }
}
