import { IApplicationClient } from '@timelapse/application'
import { contextBridge } from 'electron'

import {
  addonsInvoker,
  discordInvoker,
  headersInvoker,
  metadataInvoker,
  sessionInvoker,
  systemInvoker,
  tasksInvoker,
  timeEntriesInvoker,
  tokenStorageInvoker,
  workspacesInvoker,
} from '@/main/invokers'

const api: IApplicationClient = {
  services: {
    workspaces: workspacesInvoker,
    session: sessionInvoker,
    tasks: tasksInvoker,
    timeEntries: timeEntriesInvoker,
    metadata: metadataInvoker,
  },
  modules: {
    headers: headersInvoker,
    tokenStorage: tokenStorageInvoker,
    system: systemInvoker,
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
