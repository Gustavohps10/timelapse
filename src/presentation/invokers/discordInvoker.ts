import { IpcInvoker } from '@/presentation/adapters/IpcInvoker'
import { IDiscordInvoker } from '@/presentation/contracts/invokers/IDiscordInvoker'

export const discordInvoker: IDiscordInvoker = {
  login: (): Promise<void> => IpcInvoker.invoke('DISCORD_LOGIN'),
}
