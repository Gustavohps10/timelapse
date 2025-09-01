import { Download, Star } from 'lucide-react'
import React, { useState } from 'react'

import logoJira from '@/assets/temp-plugins-icons/jira.png'
import redmineLogo from '@/assets/temp-plugins-icons/redmine.png'
import logoYoutrack from '@/assets/temp-plugins-icons/yourtrack.png'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface DataSource {
  id: string
  name: string
  creator: string
  description: string
  path: string
  logo: string
  downloads: number
  stars: number
  installed: boolean
}

const fakePluginList: DataSource[] = [
  {
    id: 'jira',
    name: 'Jira',
    creator: 'Trackalize Team',
    description: 'Sincronize seus apontamentos com uma instância Jira.',
    path: 'trackalize/jira-plugin',
    logo: logoJira,
    downloads: 7100000,
    stars: 5,
    installed: true,
  },
  {
    id: 'redmine',
    name: 'Redmine',
    creator: 'Trackalize Team',
    description: 'Conector oficial para o Redmine.',
    path: 'trackalize/redmine-plugin',
    logo: redmineLogo,
    downloads: 1200000,
    stars: 4,
    installed: false,
  },
  {
    id: 'youtrack-1',
    name: 'Youtrack',
    creator: 'Community Contributor',
    description: 'Integre seus workspaces com projetos do YouTrack.',
    path: 'trackalize/youtrack-plugin',
    logo: logoYoutrack,
    downloads: 950000,
    stars: 4,
    installed: false,
  },
]

const formatDownloads = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'

  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'

  return num.toString()
}
interface PluginListProps {
  selectedPluginId?: string
  onSelectDataSource: (plugin: DataSource | null) => void
  onInstallPlugin?: (pluginId: string) => void
}

export function DataSourceList({
  selectedPluginId,
  onSelectDataSource,
  onInstallPlugin,
}: PluginListProps) {
  const [plugins, setPlugins] = useState<DataSource[]>(fakePluginList)
  const [installationStatus, setInstallationStatus] = useState<
    Record<string, { progress: number }>
  >({})

  const handleInstall = (pluginId: string) => {
    setInstallationStatus((prev) => ({ ...prev, [pluginId]: { progress: 0 } }))

    const interval = setInterval(() => {
      setInstallationStatus((prev) => {
        const newProgress = (prev[pluginId]?.progress || 0) + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setPlugins((prevPlugins) =>
            prevPlugins.map((p) =>
              p.id === pluginId ? { ...p, installed: true } : p,
            ),
          )
          onInstallPlugin?.(pluginId)
          const { [pluginId]: _, ...rest } = prev
          return rest
        }
        return { ...prev, [pluginId]: { progress: newProgress } }
      })
    }, 200)
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-1.5 p-1 pr-4">
        {plugins.map((plugin) => {
          const isInstalling = installationStatus[plugin.id] !== undefined
          const isSelected = selectedPluginId == plugin.id
          return (
            <Card
              key={plugin.id}
              onClick={() =>
                plugin.installed &&
                onSelectDataSource(isSelected ? null : plugin)
              }
              className={`flex items-start gap-3 p-2 transition-colors ${
                plugin.installed
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-80'
              } ${
                isSelected
                  ? 'bg-muted ring-accent ring-2'
                  : plugin.installed
                    ? 'hover:bg-muted'
                    : ''
              }`}
            >
              <img
                src={plugin.logo}
                alt={plugin.name}
                className="h-10 w-10 rounded-lg border bg-white object-contain p-1"
              />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{plugin.name}</span>
                  <div className="text-muted-foreground flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {formatDownloads(plugin.downloads)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {plugin.stars}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground line-clamp-2 text-xs leading-tight">
                  {plugin.description}
                </p>
                <div className="flex items-end justify-between pt-1">
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-semibold">
                      {plugin.creator}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {plugin.path}
                    </span>
                  </div>
                  <div className="w-24 text-right">
                    {isInstalling ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <Progress
                          value={installationStatus[plugin.id].progress}
                          className="h-1.5"
                        />
                        <span className="text-muted-foreground text-[10px]">
                          {installationStatus[plugin.id].progress}%
                        </span>
                      </div>
                    ) : plugin.installed ? (
                      <Button
                        type="button"
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        className="h-0 rounded-sm p-2 text-xs"
                        onClick={() => {
                          onSelectDataSource(isSelected ? null : plugin)
                        }}
                      >
                        {isSelected ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-0 rounded-sm p-2 text-xs"
                        onClick={() => {
                          handleInstall(plugin.id)
                        }}
                      >
                        Instalar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}
