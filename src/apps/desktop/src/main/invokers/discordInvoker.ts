import { IDiscordClient } from '@timelapse/application'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'
import { DiscordUserResponse } from '@/main/auth/discord-handler'

export const discordInvoker: IDiscordClient = {
  login: (): Promise<DiscordUserResponse> => IpcInvoker.invoke('DISCORD_LOGIN'),
}
