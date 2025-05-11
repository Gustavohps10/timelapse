import { IWindowAPIInvoker } from '@/presentation/contracts/invokers'

export const WindowClient: IWindowAPIInvoker = {
  services: {
    auth: window.api.services.auth,
    tasks: window.api.services.tasks,
    timeEntries: window.api.services.timeEntries,
  },
  modules: {
    tokenStorage: window.api.modules.tokenStorage,
  },
  requestInterceptor: window.api.requestInterceptor,
  setDefaultHeaders: window.api.setDefaultHeaders,
  getDefaultHeaders: window.api.getDefaultHeaders,
}
