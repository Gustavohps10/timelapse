import { contextBridge } from 'electron'

import { IWindowAPI } from '@/presentation/interfaces'
import { auth, tasks } from '@/presentation/invokes'

const api: IWindowAPI = {
  services: {
    tasks,
    auth,
  },
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
