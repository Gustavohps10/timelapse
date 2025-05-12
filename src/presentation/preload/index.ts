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
    console.log('Exposing API in isolated context')
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Error while exposing API:', error)
  }
} else {
  console.log('Exposing API directly in window')
  // @ts-ignore
  window.api = api
}
