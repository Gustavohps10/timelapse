import { IWindowAPIInvoker } from '@/presentation/contracts/invokers'

export const WindowClient: IWindowAPIInvoker = {
  services: {
    auth: window.api.services.auth,
    tasks: window.api.services.tasks,
    timeEntries: window.api.services.timeEntries,
  },
  modules: {
    headers: window.api.modules.headers,
    tokenStorage: window.api.modules.tokenStorage,
  },
}
