import { IApplicationAPI } from '@timelapse/application'

const ipcClient: IApplicationAPI = {
  services: window.api.services,
  modules: window.api.modules,
  integrations: window.api.integrations,
}

export { ipcClient }
