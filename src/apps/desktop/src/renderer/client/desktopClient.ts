import { IApplicationClient } from '@timelapse/application'

const ipcClient: IApplicationClient = {
  services: window.api.services,
  modules: window.api.modules,
  integrations: window.api.integrations,
}

export { ipcClient }
