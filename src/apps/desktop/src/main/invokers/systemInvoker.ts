import { ISystemClient } from '@timelapse/application'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

export const systemInvoker: ISystemClient = {
  getAppVersion: (): Promise<string> => IpcInvoker.invoke('SYSTEM_VERSION'),
}
