import { IWindowAPIInvoker } from '@/presentation/contracts/invokers'
import { ApplicationType } from '@/ui/client/ApplicationType'
import { WindowClient } from '@/ui/client/WindowClient'

export const createClient = (
  appType: keyof typeof ApplicationType,
): IWindowAPIInvoker => {
  switch (appType) {
    case ApplicationType.DESKTOP:
      return WindowClient
    default:
      throw new Error('Tipo de aplicação não suportado')
  }
}
