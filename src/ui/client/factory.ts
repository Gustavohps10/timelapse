import { IWindowAPI } from '@/presentation/interfaces'
import { ApplicationType } from '@/ui/client/ApplicationType'
import { WindowClient } from '@/ui/client/WindowClient'

export const createClient = (
  appType: keyof typeof ApplicationType,
): IWindowAPI => {
  switch (appType) {
    case ApplicationType.DESKTOP:
      return WindowClient
    default:
      throw new Error('Tipo de aplicação não suportado')
  }
}
