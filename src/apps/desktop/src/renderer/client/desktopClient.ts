import { IApplicationClient } from '@timelapse/application'
import { createOfflineFirstClient } from '@timelapse/infra/sync'

const ipcClient: IApplicationClient = {
  services: window.api.services,
  modules: window.api.modules,
  integrations: window.api.integrations,
}

export const desktopOfflineFirstClient =
  await createOfflineFirstClient(ipcClient)
