import { ipcMain } from 'electron'

import { IpcChannels } from '@/presentation/constants/IpcChannels'

export class IpcHandler {
  static handle<T>(
    channel: keyof typeof IpcChannels,
    handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<T>,
  ): void {
    ipcMain.handle(channel, handler)
  }
}
