export interface IDiscordInvoker {
  login(): Promise<{
    id: string
    username: string
    avatar: string
    global_name: string | null
    avatarUrl: string
  }>
}
