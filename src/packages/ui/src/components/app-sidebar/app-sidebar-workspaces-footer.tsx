import { User } from 'lucide-react'
import { FaDiscord } from 'react-icons/fa'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks'
import { useClient } from '@/hooks/use-client'

export function AppSidebarWorkspacesFooter() {
  const client = useClient()
  const { user, changeAvatar } = useAuth()

  async function handleDiscordLogin() {
    const discordData = await client.integrations.discord.login()
    changeAvatar(discordData.avatarUrl)
  }
  return (
    <div className="flex items-center gap-2 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} className="h-8 w-8 rounded-lg" alt="avatar" />
      ) : (
        <User className="h-8 w-8 rounded-lg bg-zinc-200 p-2 text-zinc-900" />
      )}

      <div className="flex flex-col">
        <h1 className="scroll-m-20 text-sm font-bold tracking-tighter">
          {user?.firstname && user?.lastname
            ? `${user?.firstname} ${user?.lastname}`
            : ''}
        </h1>
        <h2 className="text-muted-foreground font scroll-m-20 text-sm leading-none tracking-tight">
          {user?.login}
        </h2>
      </div>
      <Button
        onClick={handleDiscordLogin}
        size="icon"
        variant="outline"
        className="ml-auto h-7 w-7"
      >
        <FaDiscord />
      </Button>
    </div>
  )
}
