import { IAddonsInvoker } from '@/main/contracts/invokers/IAddonsInvoker'
import { IDiscordInvoker } from '@/main/contracts/invokers/IDiscordInvoker'

export interface IIntegrationsInvoker {
  discord: IDiscordInvoker
  addons: IAddonsInvoker
}
