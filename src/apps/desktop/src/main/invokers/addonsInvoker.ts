import { FileData } from '@timelapse/application'
import { IRequest } from '@timelapse/cross-cutting/transport'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import {
  AddonManifest,
  IAddonsInvoker,
} from '@/main/contracts/invokers/IAddonsInvoker'

export const addonsInvoker: IAddonsInvoker = {
  getById: (addonId: string) =>
    IpcInvoker.invoke('ADDONS_GET_BY_ID', { body: { addonId } }), // ERRADO ALTERAR PAYLOAD

  list: () => IpcInvoker.invoke('ADDONS_LIST'),

  updateLocal: (addon: AddonManifest) =>
    IpcInvoker.invoke('ADDONS_UPDATE_LOCAL', { body: addon }), // ERRADO ALTERAR PAYLOAD

  import: (payload: IRequest<{ addon: FileData }>) =>
    IpcInvoker.invoke('ADDONS_IMPORT', payload),

  getInstaller: (payload: IRequest<{ installerUrl: string }>) =>
    IpcInvoker.invoke('ADDONS_GET_INSTALLER', payload),

  install: (
    payload: IRequest<
      { downloadUrl: string } & { onProgress?: (progress: number) => void }
    >,
  ) => IpcInvoker.invoke('ADDONS_INSTALL', payload),
}
