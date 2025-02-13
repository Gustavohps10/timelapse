import { contextBridge, ipcRenderer } from 'electron';

// Definir a interface para a API exposta
interface Api {
  fetchRedmine: () => Promise<any>;
}

const api: Api = {
  fetchRedmine: () => ipcRenderer.invoke("fetch-redmine"),
};

// Expondo a API
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error("Erro ao expor API:", error);
  }
} else {
  // @ts-ignore (define em dts)
  window.api = api;
}
