import { ipcRenderer } from 'electron'

import { IpcChannels } from '@/presentation/constants/IpcChannels'

export class IpcInvoker {
  static invoke<R>(
    channel: keyof typeof IpcChannels,
    ...args: any[]
  ): Promise<R> {
    return ipcRenderer.invoke(channel, ...args)
  }
}
