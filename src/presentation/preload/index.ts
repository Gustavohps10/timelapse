import { contextBridge } from 'electron'

const defaultHeaders: Record<string, string> = {}

import { IRequest } from '@/presentation/contracts/http'
import { IWindowAPIInvoker } from '@/presentation/contracts/invokers'
import {
  authInvoker,
  tasksInvoker,
  timeEntriesInvoker,
  tokenStorageInvoker,
} from '@/presentation/invokers'

const api: IWindowAPIInvoker = {
  services: {
    tasks: tasksInvoker,
    auth: authInvoker,
    timeEntries: timeEntriesInvoker,
  },
  modules: {
    tokenStorage: tokenStorageInvoker,
  },
  requestInterceptor: async (requestOptions: IRequest<any>) => {
    requestOptions.headers = {
      ...defaultHeaders,
      ...(requestOptions.headers ?? {}),
    }
    return requestOptions
  },
  setDefaultHeaders: (headers) => {
    Object.assign(defaultHeaders, headers)
  },
  getDefaultHeaders: () => ({ ...defaultHeaders }),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Erro ao expor API:', error)
  }
} else {
  // Se o contexto não for isolado, defina diretamente
  // @ts-ignore
  window.api = api
}
