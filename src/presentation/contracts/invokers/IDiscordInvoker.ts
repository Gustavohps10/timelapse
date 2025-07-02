import { DiscordUserResponse } from '@/presentation/auth/discord-handler'

export interface IDiscordInvoker {
  login(): Promise<DiscordUserResponse>
}
