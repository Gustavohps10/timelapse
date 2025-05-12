import { IWindowAPIInvoker } from '@/presentation/contracts/invokers'
import {
  authInvoker,
  headersInvoker,
  tasksInvoker,
  timeEntriesInvoker,
  tokenStorageInvoker,
} from '@/presentation/invokers'

const { contextBridge } = require('electron')

const api: IWindowAPIInvoker = {
  services: {
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
