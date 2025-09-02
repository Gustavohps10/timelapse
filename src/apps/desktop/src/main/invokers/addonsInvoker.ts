import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import {
  AddonManifest,
  IAddonsInvoker,
} from '@/main/contracts/invokers/IAddonsInvoker'

export const addonsInvoker: IAddonsInvoker = {
  getById: (addonId: string) =>
    IpcInvoker.invoke('ADDONS_GET_BY_ID', { body: { addonId } }),

  list: () => IpcInvoker.invoke('ADDONS_LIST'),

  updateLocal: (addon: AddonManifest) =>
    IpcInvoker.invoke('ADDONS_UPDATE_LOCAL', { body: addon }),
}
