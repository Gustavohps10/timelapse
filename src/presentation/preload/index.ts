import { IWindowAPIInvoker } from '@/presentation/contracts/invokers'
import {
  authInvoker,
  headersInvoker,
  sessionInvoker,
  tasksInvoker,
  timeEntriesInvoker,
  tokenStorageInvoker,
} from '@/presentation/invokers'

const { contextBridge } = require('electron')

const api: IWindowAPIInvoker = {
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
