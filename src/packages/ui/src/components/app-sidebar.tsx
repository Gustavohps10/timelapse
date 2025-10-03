import { useQuery } from '@tanstack/react-query'
import { BoxIcon, Compass, HomeIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import logoAtak from '@/assets/logo-atak.png'
import { ModeToggle } from '@/components/mode-toggle'
import { NewWorkspaceDialog } from '@/components/new-workspace-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { useClient } from '@/hooks/use-client'

export type AppSidebarProps = {
  content: React.ReactNode
  footer: React.ReactNode
}

export function AppSidebar({ content, footer }: AppSidebarProps) {
  const client = useClient()

  const { data: workspacesResponse } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => client.services.workspaces.listAll(),
  })

  const [workspaceDialogIsOpen, setWorkspaceDialogIsOpen] = useState(false)

  return (
    <Sidebar
      collapsible="none"
      className="z-40 flex h-[100vh] w-[300px] flex-row"
    >
      <NewWorkspaceDialog
        isOpen={workspaceDialogIsOpen}
        setIsOpen={setWorkspaceDialogIsOpen}
      />

      <nav className="flex flex-col items-center space-y-3 p-3">
        <Link
          to="/"
          className="group bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ease-in-out hover:rounded-2xl"
        >
          <HomeIcon />
          <span className="bg-foreground text-background absolute left-full ml-4 hidden -translate-x-2 cursor-pointer rounded-md px-2 py-1 text-xs font-semibold opacity-0 transition-all group-hover:block group-hover:translate-x-0 group-hover:opacity-100">
            Inicio
          </span>{' '}
        </Link>

        <hr className="w-8 border-t" />

        {workspacesResponse?.data?.map((workspace) => (
          <div key={workspace.id} className="group relative">
            <Link to={`/workspaces/${workspace.id}`}>
              <div className="bg-muted group-hover:bg-primary flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ease-in-out">
                <BoxIcon />
              </div>
            </Link>
            <span className="bg-foreground text-background absolute left-full ml-4 hidden -translate-x-2 rounded-md px-2 py-1 text-xs font-semibold opacity-0 transition-all group-hover:block group-hover:translate-x-0 group-hover:opacity-100">
              {workspace.name}
            </span>
          </div>
        ))}

        <hr className="w-8 border-t" />

        <button
          onClick={() => setWorkspaceDialogIsOpen(true)}
          className="group bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ease-in-out hover:rounded-2xl"
        >
          <PlusIcon />
          <span className="bg-foreground text-background absolute left-full ml-4 hidden -translate-x-2 cursor-pointer rounded-md px-2 py-1 text-xs font-semibold opacity-0 transition-all group-hover:block group-hover:translate-x-0 group-hover:opacity-100">
            Adicionar
          </span>
        </button>

        <button className="group bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ease-in-out hover:rounded-2xl">
          <Compass />
          <span className="bg-foreground text-background absolute left-full ml-4 hidden -translate-x-2 rounded-md px-2 py-1 text-xs font-semibold opacity-0 transition-all group-hover:block group-hover:translate-x-0 group-hover:opacity-100">
            Descobrir
          </span>
        </button>
      </nav>

      <div className="mt-2 flex flex-1 flex-col rounded-tl-lg border-t border-r border-l">
        <SidebarHeader className="z-40">
          <div className="flex items-center gap-2 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <img
              src={logoAtak}
              className="h-8 w-8 rounded-lg bg-zinc-200 p-2"
              alt="Logo"
            />
            <div className="flex flex-col">
              <h1 className="scroll-m-20 text-sm font-bold tracking-tighter">
                Timelapse
              </h1>
              <h2 className="text-muted-foreground font scroll-m-20 text-sm leading-none tracking-tight">
                Manager
              </h2>
            </div>
            <ModeToggle className="text-foreground ml-auto size-8 cursor-pointer rounded-lg p-1 hover:bg-[#e7e7e9] dark:hover:bg-[#2e2e31]" />
          </div>
        </SidebarHeader>
        <SidebarContent className="z-40">
          <ScrollArea className="h-full">{content}</ScrollArea>
        </SidebarContent>
        <SidebarFooter className="mb-2">{footer}</SidebarFooter>
      </div>
    </Sidebar>
  )
}
