import { IApplicationClient } from '@timelapse/application'
import { createOfflineFirstClient } from '@timelapse/infra/sync'

const ipcClient: IApplicationClient = {
  services: window.api.services,
  modules: window.api.modules,
  integrations: window.api.integrations,
}

const offlineClientResult = await createOfflineFirstClient(ipcClient)

let desktopOfflineFirstClient: IApplicationClient

if (offlineClientResult.isFailure()) {
  console.error(
    'Erro ao criar cliente offline-first:',
    offlineClientResult.failure,
  )
} else {
  desktopOfflineFirstClient = offlineClientResult.success
  console.log('Sucesso ao criar cliente offline-first')
}

export { desktopOfflineFirstClient }
