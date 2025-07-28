import { useQuery } from '@tanstack/react-query'
import { WorkspaceViewModel } from '@trackalize/presentation/view-models'
import {
  ChartLine,
  ChevronRight,
  FileText,
  LogOut,
  Plus,
  Timer,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { FaDiscord } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'

import logoAtak from '@/assets/logo-atak.png'
import { ModeToggle } from '@/components/mode-toggle'
import { NewWorkspaceDialog } from '@/components/new-workspace-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { useClient } from '@/hooks/use-client'

const mainItems = [
  { title: 'Dashboard', url: '/', icon: ChartLine },
  { title: 'Apontamento', url: '/time-entries', icon: Timer },
  { title: 'Documentação', url: '/docs', icon: FileText },
]

export function AppSidebar() {
  const client = useClient()
  const { logout, user, changeAvatar } = useAuth()
  const [workspaceDialogIsOpen, setWorkspaceDialogIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  async function handleDiscordLogin() {
    const discordData = await client.integrations.discord.login()
    changeAvatar(discordData.avatarUrl)
  }

  const { data: workspacesResponse } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => client.workspaces.listAll(),
  })

  return (
    <Sidebar collapsible="none" className="h-[100vh] border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <img
            src={logoAtak}
            className="h-8 w-8 rounded-lg bg-zinc-200 p-2"
            alt="Logo"
          />
          <div className="flex flex-col">
            <h1 className="scroll-m-20 text-sm font-bold tracking-tighter">
              Trackalize
            </h1>
            <h2 className="text-muted-foreground font scroll-m-20 text-sm leading-none tracking-tight">
              Manager
            </h2>
          </div>
          <ModeToggle className="text-foreground ml-auto size-8 cursor-pointer rounded-lg p-1 hover:bg-[#e7e7e9] dark:hover:bg-[#2e2e31]" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NewWorkspaceDialog
          isOpen={workspaceDialogIsOpen}
          setIsOpen={setWorkspaceDialogIsOpen}
        />

        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel>Navegar</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center rounded-md transition-colors [&.active]:bg-zinc-100 dark:[&.active]:bg-zinc-800"
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon
                              className={
                                isActive ? 'text-primary' : 'text-foreground'
                              }
                            />
                            <span>{item.title}</span>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Recursos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen className="group">
                  <SidebarMenuItem>
                    <div className="flex items-center">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="flex-1">
                          <span>Workspaces</span>
                          <div className="ml-auto flex items-center gap-1">
                            <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <Plus
                        className="text-muted-foreground hover:text-foreground ml-2 h-4 w-4 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation() // só por segurança
                          setWorkspaceDialogIsOpen(true)
                        }}
                      />
                    </div>

                    {workspacesResponse?.data?.map(
                      (workspace: WorkspaceViewModel) => (
                        <CollapsibleContent key={workspace.id}>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuButton>
                                <span>{workspace.name}</span>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      ),
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              className="h-8 w-8 rounded-lg"
              alt="avatar"
            />
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="outline" className="ml-auto h-7 w-7">
                <LogOut />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Voce tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Voce será desconectado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
