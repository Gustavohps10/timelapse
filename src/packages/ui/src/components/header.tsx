'use client'

import { Share2Icon } from 'lucide-react'
import { AiOutlineCloudSync } from 'react-icons/ai'

import logoAtak from '@/assets/logo-atak.png'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useWorkspace } from '@/hooks'
import { useSyncStore } from '@/stores/syncStore'

export function Header() {
  const { workspace } = useWorkspace()
  const statuses = useSyncStore((s) => s?.statuses)
  const dbName = useSyncStore((s) => s?.db?.name)
  const isInitialized = useSyncStore((s) => s?.isInitialized)

  const getOverallStatusColor = () => {
    if (!isInitialized || !statuses) return 'bg-muted'
    const values = Object.values(statuses)
    if (values.some((s) => s?.error)) return 'bg-red-500'
    if (values.some((s) => s?.isPulling || s?.isPushing))
      return 'bg-blue-500 animate-pulse'
    return 'bg-green-500'
  }

  const replicationNames = statuses ? Object.keys(statuses) : []

  return (
    <header className="pointer-events-none absolute top-0 left-0 z-50 flex w-full justify-center bg-transparent p-2">
      <div className="border-border bg-background/60 pointer-events-auto flex items-center justify-between gap-2 rounded-md border px-2 py-1 shadow-md backdrop-blur-md">
        <div className="inline-block rounded-sm bg-zinc-200 p-1">
          <img src={logoAtak} className="h-3 w-3" alt="Logo" />
        </div>

        <div className="flex flex-col">
          <span className="text-uppercase font-sans text-xs leading-3 font-semibold tracking-tight">
            {workspace?.name}
          </span>
          <span className="text-muted-foreground font-mono text-xs leading-3">
            {workspace?.id}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Status da Sincronização"
                    className="hover:bg-accent/50 relative h-6 w-6"
                  >
                    <AiOutlineCloudSync
                      style={{
                        width: 16,
                        height: 16,
                        color: 'rgb(var(--foreground))',
                      }}
                    />
                    <span
                      className={`border-background absolute right-1.5 bottom-0.5 h-2.5 w-2.5 rounded-full border-2 ${getOverallStatusColor()}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver status da sincronização</TooltipContent>
              </Tooltip>
            </PopoverTrigger>

            <PopoverContent
              className="border-border w-72 rounded-lg border shadow-xl"
              align="end"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm leading-none font-medium">
                    Status da Sincronização
                  </h4>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {dbName ? `Banco: ${dbName}` : 'Não conectado'}
                  </p>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  {isInitialized && replicationNames.length > 0 ? (
                    replicationNames.map((name) => {
                      const status = statuses?.[name]
                      if (!status) return null

                      const color = status.error
                        ? 'text-red-500'
                        : status.isPulling || status.isPushing
                          ? 'text-blue-500'
                          : 'text-green-500'

                      const label = status.error
                        ? 'Erro'
                        : status.isPulling || status.isPushing
                          ? 'Sincronizando...'
                          : 'Ativo'

                      return (
                        <div
                          key={name}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground capitalize">
                            {name}
                          </span>
                          <span className={`font-semibold ${color}`}>
                            {label}
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      Sincronização inativa.
                    </p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Compartilhar"
                className="hover:bg-accent/50 h-6 w-6"
              >
                <Share2Icon
                  style={{
                    width: 14,
                    height: 14,
                    color: 'rgb(var(--foreground))',
                  }}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compartilhar</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}
