import { contextBridge } from 'electron'

import { IWindowAPIInvoker } from '@/main/contracts/invokers'
import {
  discordInvoker,
  headersInvoker,
  sessionInvoker,
  tasksInvoker,
  timeEntriesInvoker,
  tokenStorageInvoker,
  workspacesInvoker,
} from '@/main/invokers'
import { addonsInvoker } from '@/main/invokers/addonsInvoker'

const api: IWindowAPIInvoker = {
  services: {
    workspaces: workspacesInvoker,
    session: sessionInvoker,
    tasks: tasksInvoker,
    timeEntries: timeEntriesInvoker,
  },
  modules: {
    headers: headersInvoker,
    tokenStorage: tokenStorageInvoker,
  },
  integrations: {
    discord: discordInvoker,
    addons: addonsInvoker,
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
