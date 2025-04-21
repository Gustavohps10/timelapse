import { ipcMain, ipcRenderer } from 'electron'

import { IpcChannels } from '@/presentation/constants/IpcChannels'

export class IpcHandler {
  // Responsavel por registrar um servico que sera executado pelo main Process
  static handle<T>(
    channel: keyof typeof IpcChannels,
    handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<T>,
  ): void {
    ipcMain.handle(channel, handler)
  }

  // Responsavel por executar um servico do main Process
  static invoke<R>(
    channel: keyof typeof IpcChannels,
    ...args: any[]
  ): Promise<R> {
    return ipcRenderer.invoke(channel, ...args)
  }
}
