import { useQuery } from '@tanstack/react-query'
import { cva } from 'class-variance-authority'
import { BoxIcon, Compass, HomeIcon, PlusIcon } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { NavLink } from 'react-router-dom'

import { NewWorkspaceDialog } from '@/components/new-workspace-dialog'
import { Toaster } from '@/components/ui/sonner'
import { useClient } from '@/hooks'
import { cn } from '@/lib'

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

export function AppLayout() {
  const location = useLocation()
  const [workspaceDialogIsOpen, setWorkspaceDialogIsOpen] = useState(false)
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

  const openWorkspaceDialog = () => setWorkspaceDialogIsOpen(true)

  return (
    <>
      <NewWorkspaceDialog
        isOpen={workspaceDialogIsOpen}
        setIsOpen={setWorkspaceDialogIsOpen}
      />

      <main className="flex h-screen w-screen overflow-hidden pt-4">
        {/* Menu lateral fixo */}
        <nav
          ref={navRef}
          className="relative flex w-[72px] flex-col items-center space-y-3"
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

        {/* Área principal do app */}
        <section className="flex flex-1 overflow-hidden rounded-tl-md border-t-1 border-l-1">
          <Outlet />
        </section>
      </main>
      <Toaster />
    </>
  )
}
