import { contextBridge, ipcRenderer } from 'electron';
import { WindowAPI } from '../main/types/window-api.js';

const api: WindowAPI = {
  redmine: {
    currentUser: (data) => ipcRenderer.invoke('currentUser', data),
  },
  keytar: {
    savePassword: (service, account, password) => ipcRenderer.invoke('keytar:savePassword', { service, account, password }),
    getPassword: (service, account) => ipcRenderer.invoke('keytar:getPassword', { service, account }),
    deletePassword: (service, account) => ipcRenderer.invoke('keytar:deletePassword', { service, account }),
  },
};

// Expor no `window.api`
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error("Erro ao expor API:", error);
  }
} else {
  // Se o contexto não for isolado, defina diretamente
  // @ts-ignore
  window.api = api;
}
