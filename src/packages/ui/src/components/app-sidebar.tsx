import {
  ChartLine,
  ChevronRight,
  FileText,
  LogOut,
  Plus,
  Timer,
  User,
} from 'lucide-react'
import { FaDiscord } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'

import logoAtak from '@/assets/logo-atak.png'
import { ModeToggle } from '@/components/mode-toggle'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  const handleLogout = () => {
    logout()
  }

  async function handleDiscordLogin() {
    const discordData = await client.integrations.discord.login()

    changeAvatar(discordData.avatarUrl)
  }

  async function handleNewWorkspace() {
    await client.workspaces.create({
      body: { name: 'qualquer', pluginId: 'trackalize/redmine-plugin' },
    })
  }

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
                        className="flex h-9! items-center rounded-md transition-colors [&.active]:bg-zinc-100 dark:[&.active]:bg-zinc-800"
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
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <span>Workspaces</span>

                        <div className="ml-auto flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Plus
                                className="text-muted-foreground hover:text-foreground h-4 w-4 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </DialogTrigger>

                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Novo Workspace</DialogTitle>
                                <DialogDescription>
                                  Configure os detalhes antes de criar.
                                </DialogDescription>
                              </DialogHeader>

                              <Tabs defaultValue="geral" className="mt-4">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="geral">Geral</TabsTrigger>
                                  <TabsTrigger value="permissoes">
                                    Permissões
                                  </TabsTrigger>
                                  <TabsTrigger value="avancado">
                                    Avançado
                                  </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                  value="geral"
                                  className="mt-4 space-y-4"
                                >
                                  <div className="space-y-2">
                                    <Label htmlFor="nome">
                                      Nome do Workspace
                                    </Label>
                                    <Input
                                      id="nome"
                                      placeholder="Ex: Equipe Financeiro"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="valorHora">
                                      Valor Hora Trabalhada (R$)
                                    </Label>
                                    <Input
                                      id="valorHora"
                                      placeholder="Ex: 95.00"
                                      type="number"
                                    />
                                  </div>
                                </TabsContent>

                                <TabsContent
                                  value="permissoes"
                                  className="mt-4 space-y-4"
                                >
                                  <div className="space-y-2">
                                    <Label htmlFor="membros">
                                      Membros Permitidos
                                    </Label>
                                    <Input
                                      id="membros"
                                      placeholder="Emails separados por vírgula"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Permissões</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma permissão padrão" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">
                                          Administrador
                                        </SelectItem>
                                        <SelectItem value="editor">
                                          Editor
                                        </SelectItem>
                                        <SelectItem value="leitor">
                                          Somente Leitura
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TabsContent>

                                <TabsContent
                                  value="avancado"
                                  className="mt-4 space-y-4"
                                >
                                  <p className="text-muted-foreground text-sm">
                                    Futuramente aqui entrarão opções
                                    configuráveis via plugin.
                                  </p>
                                  <div className="space-y-2">
                                    <Label htmlFor="codigo">
                                      Código do plugin (exemplo estático)
                                    </Label>
                                    <Input
                                      id="codigo"
                                      placeholder="ex: WKS-001"
                                    />
                                  </div>
                                </TabsContent>
                              </Tabs>

                              <DialogFooter className="mt-4">
                                <Button variant="outline">Cancelar</Button>
                                <Button>Criar</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuButton>
                            <span>ESPACO ATAK</span>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
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
