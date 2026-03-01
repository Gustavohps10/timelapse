'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, Clock, Database, Share2Icon } from 'lucide-react'
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
  TooltipProvider,
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
    <header className="pointer-events-none absolute top-0 left-0 z-50 flex w-full justify-center bg-transparent pl-[calc(72px+240px)]">
      <div className="p-2">
        <div className="border-border bg-background/80 pointer-events-auto flex items-center justify-between gap-3 rounded-md border px-1 shadow-sm backdrop-blur-xl">
          {/* Workspace Info Section - Compacto */}
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-zinc-100 p-1 shadow-sm">
              <img
                src={logoAtak}
                className="h-full w-full object-contain"
                alt="Logo"
              />
            </div>
            <div className="flex min-w-max flex-col leading-tight">
              <span className="text-foreground text-[10px] font-bold tracking-tight whitespace-nowrap">
                {workspace?.name}
              </span>
              <span className="text-muted-foreground/70 font-mono text-[11px] whitespace-nowrap">
                {workspace?.id}
              </span>
            </div>
          </div>

          <Separator orientation="vertical" className="h-5 opacity-50" />

          {/* Actions Section */}
          <div className="flex items-center gap-0.5">
            <TooltipProvider delayDuration={200}>
              <Popover>
                <Tooltip>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-accent/50 relative h-6 w-6 rounded-sm"
                      >
                        <AiOutlineCloudSync
                          size={16}
                          className="text-foreground/80"
                        />
                        <span
                          className={`border-background absolute right-0.5 bottom-0.5 h-2 w-2 rounded-full border ${getOverallStatusColor()}`}
                        />
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <TooltipContent side="bottom" className="text-[10px]">
                    Sincronização
                  </TooltipContent>
                </Tooltip>

                <PopoverContent
                  className="border-border bg-background/95 w-auto max-w-md min-w-[260px] rounded-md p-0 shadow-2xl backdrop-blur-sm"
                  align="end"
                  sideOffset={6}
                >
                  {/* Popover Header */}
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <div className="rounded-sm bg-blue-500/10 p-1.5 text-blue-600">
                      <Activity size={14} />
                    </div>
                    <div className="flex min-w-max flex-col">
                      <h4 className="text-[11px] leading-none font-bold">
                        Monitor de Sincronização
                      </h4>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 font-mono text-[9px] whitespace-nowrap">
                        <Database size={10} className="shrink-0" />
                        <span>{dbName || 'Conectando...'}</span>
                      </div>
                    </div>
                  </div>

                  {/* List of Replication */}
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    <div className="space-y-0.5">
                      {isInitialized && replicationNames.length > 0 ? (
                        replicationNames.map((name) => {
                          const status = statuses?.[name]
                          if (!status) return null

                          const dotStatusColor = status.error
                            ? 'bg-red-500'
                            : status.isPulling || status.isPushing
                              ? 'bg-blue-500 animate-pulse'
                              : 'bg-green-500'

                          return (
                            <div
                              key={name}
                              className="hover:bg-accent/30 rounded-sm border border-transparent px-2 py-1.5 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-6">
                                <span className="text-foreground/90 text-[10px] font-bold capitalize">
                                  {name}
                                </span>

                                {/* Status Indicator */}
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${dotStatusColor}`}
                                  />
                                  <span className="text-muted-foreground text-[9px] font-bold">
                                    {status.error
                                      ? 'Erro'
                                      : status.isPulling
                                        ? 'Buscando dados...'
                                        : 'Sincronizado'}
                                  </span>
                                </div>
                              </div>

                              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[8px] font-medium">
                                <Clock size={8} className="shrink-0" />
                                <span>
                                  {status.lastReplication
                                    ? format(
                                        status.lastReplication,
                                        "HH:mm:ss 'em' dd/MM",
                                        { locale: ptBR },
                                      )
                                    : 'Pendente'}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-muted-foreground py-4 text-center text-[9px] italic">
                          Inicializando...
                        </div>
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
                    className="hover:bg-accent/50 h-6 w-6 rounded-sm"
                  >
                    <Share2Icon size={14} className="text-foreground/70" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Compartilhar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  )
}
