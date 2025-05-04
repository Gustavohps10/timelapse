import { IWindowAPI } from '@/presentation/interfaces'

export const WindowClient: IWindowAPI = {
  services: {
    auth: window.api.services.auth,
    tasks: window.api.services.tasks,
  },
  modules: {
    tokenStorage: window.api.modules.tokenStorage,
  },
}
