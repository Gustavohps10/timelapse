import { useQuery } from '@tanstack/react-query'
import { cva } from 'class-variance-authority'
import { BoxIcon, Compass, HomeIcon, PlusIcon } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

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
import { cn } from '@/lib/utils'

export type AppSidebarProps = {
  content: React.ReactNode
  footer: React.ReactNode
}

const sidebarButtonVariants = cva(
  'group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl shadow-sm transition-all duration-200 ease-in-out hover:rounded-2xl',
  {
    variants: {
      isActive: {
        true: 'bg-primary text-primary-foreground',
        false:
          'bg-background text-muted-foreground hover:bg-primary hover:text-primary-foreground',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
)

const tooltipVariants = cva(
  'absolute left-full ml-4 hidden -translate-x-2 rounded-md bg-foreground px-2 py-1 text-xs font-semibold text-background opacity-0 transition-all group-hover:block group-hover:translate-x-0 group-hover:opacity-100',
)

export function AppSidebar({ content, footer }: AppSidebarProps) {
  const location = useLocation()
  const [workspaceDialogIsOpen, setWorkspaceDialogIsOpen] = useState(false)

  const openWorkspaceDialog = () => setWorkspaceDialogIsOpen(true)

  const client = useClient()
  const { data: workspacesResponse } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => client.services.workspaces.listAll(),
  })

  const [activeTop, setActiveTop] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const activeEl = navRef.current?.querySelector('.workspace-active')
    if (activeEl && navRef.current) {
      const rect = activeEl.getBoundingClientRect()
      const navRect = navRef.current.getBoundingClientRect()
      setActiveTop(rect.top - navRect.top)
    } else {
      setActiveTop(null)
    }
  }, [workspacesResponse, location.pathname])

  return (
    <Sidebar
      collapsible="none"
      className="z-40 flex h-screen w-[300px] flex-row"
    >
      <NewWorkspaceDialog
        isOpen={workspaceDialogIsOpen}
        setIsOpen={setWorkspaceDialogIsOpen}
      />

      <nav
        ref={navRef}
        className="relative flex flex-col items-center space-y-3 border-r-0 bg-zinc-50 p-3 dark:bg-zinc-900/50"
      >
        {activeTop !== null && (
          <span
            className="bg-primary absolute left-0 w-1 rounded-r-md transition-all duration-300 ease-in-out"
            style={{ top: activeTop, height: 40 }}
          />
        )}

        <NavLink to="/" end>
          {({ isActive }) => (
            <div
              className={cn(
                sidebarButtonVariants({ isActive }),
                isActive && 'workspace-active',
              )}
            >
              <HomeIcon className="size-5" />
            </div>
          )}
        </NavLink>

        <hr className="w-8 border-t" />

        {workspacesResponse?.data?.map((workspace) => (
          <NavLink
            key={workspace.id}
            to={`/workspaces/${workspace.id}`}
            className={({ isActive }) =>
              cn(
                sidebarButtonVariants({ isActive }),
                isActive && 'workspace-active',
              )
            }
          >
            <BoxIcon className="size-5" />
          </NavLink>
        ))}

        <hr className="w-8 border-t" />

        <button
          onClick={openWorkspaceDialog}
          className={cn(sidebarButtonVariants())}
        >
          <PlusIcon className="size-5" />
        </button>

        <button className={cn(sidebarButtonVariants())}>
          <Compass className="size-5" />
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
              <h2 className="text-muted-foreground scroll-m-20 text-sm leading-none tracking-tight">
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
