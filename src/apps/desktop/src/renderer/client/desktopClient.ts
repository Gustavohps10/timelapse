import { IClient } from '@trackalize/ui'

export const desktopClient: IClient = {
  workspaces: window.api.workspaces,
  services: window.api.services,
  modules: window.api.modules,
  integrations: window.api.integrations,
}
