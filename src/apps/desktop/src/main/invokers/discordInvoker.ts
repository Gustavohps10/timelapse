import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { DiscordUserResponse } from '@/main/auth/discord-handler'
import { IDiscordInvoker } from '@/main/contracts/invokers/IDiscordInvoker'

export const discordInvoker: IDiscordInvoker = {
  login: (): Promise<DiscordUserResponse> => IpcInvoker.invoke('DISCORD_LOGIN'),
}
