import { ipcRenderer } from 'electron'

import { IpcChannels } from '@/presentation/constants/IpcChannels'

export class IpcInvoker {
  static invoke<Req, Res>(
    channel: keyof typeof IpcChannels,
    payload?: Req,
  ): Promise<Res> {
    return ipcRenderer.invoke(channel, payload)
  }
}
