'use client'

import { ClipboardList, LayoutGrid } from 'lucide-react'
import { NavLink, Outlet, useParams } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function ActivitiesLayout() {
  const { workspaceId } = useParams()

  const nav = [
    {
      to: `/workspaces/${workspaceId}/activities`,
      label: 'Área de Trabalho',
      icon: LayoutGrid,
      end: true, // marca apenas a rota exata como ativa
    },
    {
      to: `/workspaces/${workspaceId}/activities/backlog`,
      label: 'Backlog',
      icon: ClipboardList,
      end: false,
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="border-b">
        <div className="flex gap-6">
          {nav.map((n) => {
            const Icon = n.icon
            return (
              <NavLink key={n.to} to={n.to} end={n.end}>
                {({ isActive }) => (
                  <div
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-3 text-sm font-bold tracking-tighter transition-colors',
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon size={16} />
                    {n.label}

                    <span
                      className={cn(
                        'absolute bottom-0 left-0 h-[3px] w-full rounded-full transition-all',
                        isActive ? 'bg-primary' : 'bg-transparent',
                      )}
                    />
                  </div>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 py-4">
        <Outlet />
      </div>
    </div>
  )
}
