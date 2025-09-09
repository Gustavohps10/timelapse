import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { ISystemInvoker } from '@/main/contracts/invokers/ISystemInvoker'

export const systemInvoker: ISystemInvoker = {
  getAppVersion: (): Promise<string> => IpcInvoker.invoke('SYSTEM_VERSION'),
}
