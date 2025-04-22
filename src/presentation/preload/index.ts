import { contextBridge } from 'electron'

import { tasks } from '@/presentation/invokes'
import { WindowAPI } from '@/presentation/types/WindowApi'

const api: WindowAPI = {
  services: {
    tasks,
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
