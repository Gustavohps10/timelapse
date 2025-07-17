import { contextBridge } from 'electron'

import { IWindowAPIInvoker } from '@/main/contracts/invokers'
import {
  authInvoker,
  discordInvoker,
  headersInvoker,
  sessionInvoker,
  tasksInvoker,
  timeEntriesInvoker,
  tokenStorageInvoker,
} from '@/main/invokers'
import { workspacesInvoker } from '@/main/invokers/workspacesInvoker'

const api: IWindowAPIInvoker = {
  workspaces: workspacesInvoker,
  services: {
    session: sessionInvoker,
    tasks: tasksInvoker,
    auth: authInvoker,
    timeEntries: timeEntriesInvoker,
  },
  modules: {
    headers: headersInvoker,
    tokenStorage: tokenStorageInvoker,
  },
  integrations: {
    discord: discordInvoker,
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Error while exposing API:', error)
  }
} else {
  // @ts-ignore
  window.api = api
}
