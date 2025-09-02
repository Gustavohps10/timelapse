import { IClient } from '@timelapse/ui'

export const desktopClient: IClient = {
  services: window.api.services,
  modules: window.api.modules,
  integrations: window.api.integrations,
}
