import { useQuery } from '@tanstack/react-query'
import { Download, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AddonInstaller, AddonManifest } from '@/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClient } from '@/hooks/use-client'
import { queryClient } from '@/lib'

const formatDownloads = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

interface PluginListProps {
  selectedPluginId?: string
  onSelectDataSource: (plugin: AddonManifest | null) => void
  onInstallPlugin?: (pluginId: string) => void
}

export function DataSourceList({
  selectedPluginId,
  onSelectDataSource,
  onInstallPlugin,
}: PluginListProps) {
  const client = useClient()
  const [installerData, setInstallerData] = useState<AddonInstaller | null>(
    null,
  )
  const [loadingInstaller, setLoadingInstaller] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(
    undefined,
  )
  const [installationStatus, setInstallationStatus] = useState<
    Record<string, { progress: number }>
  >({})

  const { data: plugins = [], isLoading: loadingPlugins } = useQuery({
    queryKey: ['addons'],
    queryFn: () => client.integrations.addons.list(),
    staleTime: 1000 * 60 * 5,
  })

  const { data: appVersion } = useQuery({
    queryKey: ['appVersion'],
    queryFn: () => client.modules.system.getAppVersion(),
    staleTime: Infinity,
  })

  const openInstallerModal = async (plugin: AddonManifest) => {
    setIsModalOpen(true)
    setLoadingInstaller(true)
    try {
      const data = await client.integrations.addons.getInstaller({
        body: { installerUrl: plugin.installerManifestUrl! },
      })
      setInstallerData(data)
    } finally {
      setLoadingInstaller(false)
    }
  }

  const handleInstall = async () => {
    if (!installerData || !selectedVersion) return

    const pkg = installerData.packages.find(
      (p) => p.version === selectedVersion,
    )
    if (!pkg) return

    const pluginId = installerData.id
    const downloadUrl = pkg.downloadUrl

    setInstallationStatus((prev) => ({
      ...prev,
      [pluginId]: { progress: 0 }, // só indica que está iniciando
    }))

    try {
      await client.integrations.addons.install({ body: { downloadUrl } })

      onInstallPlugin?.(pluginId)
      queryClient.invalidateQueries({ queryKey: ['addons'] })
      setInstallationStatus((prev) => {
        const { [pluginId]: _, ...rest } = prev
        return rest
      })
      setIsModalOpen(false)
      setInstallerData(null)
      setSelectedVersion(undefined)
    } catch (err) {
      console.error('Erro ao instalar plugin:', err)
    }
  }

  useEffect(() => {
    if (installerData && appVersion) {
      const firstCompatible = installerData.packages.find(
        (pkg) => pkg.requiredApiVersion === appVersion,
      )
      if (firstCompatible) {
        setSelectedVersion(firstCompatible.version)
      }
    }
  }, [installerData, appVersion])

  if (loadingPlugins) {
    return (
      <div className="text-muted-foreground p-4 text-sm">
        Carregando plugins...
      </div>
    )
  }

  return (
    <>
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) {
            setInstallerData(null)
            setSelectedVersion(undefined)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Instalar {installerData?.id}</span>
              {loadingInstaller && <Progress className="h-1 w-24" value={50} />}
            </DialogTitle>
            <DialogDescription>
              Selecione a versão desejada para instalar
            </DialogDescription>
          </DialogHeader>

          {installerData ? (
            <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
              {installerData.packages.map((pkg) => {
                const isCompatible = pkg.requiredApiVersion === appVersion
                const isFirstCompatible = isCompatible && !selectedVersion
                const isSelected =
                  selectedVersion === pkg.version || isFirstCompatible

                const downloadUrl = pkg.downloadUrl

                return (
                  <Card
                    key={pkg.version}
                    className={`border p-2 transition ${
                      !isCompatible
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    } ${
                      isSelected
                        ? 'border-primary bg-accent/20 border-2'
                        : 'border'
                    }`}
                    onClick={() =>
                      isCompatible && setSelectedVersion(pkg.version)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">
                          {pkg.version}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Requer API: {pkg.requiredApiVersion}
                        </div>
                      </div>
                      <div className="text-xs">{pkg.releaseDate}</div>
                    </div>
                    <ul className="text-muted-foreground mt-1 list-disc pl-4 text-[12px]">
                      {pkg.changelog.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div>Carregando informações do plugin...</div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              type="button"
              variant="default"
              disabled={loadingInstaller || !selectedVersion}
              onClick={handleInstall}
            >
              Instalar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScrollArea className="h-full w-full">
        <div className="flex flex-col gap-1.5 p-1 pr-4">
          <Tabs defaultValue="installed" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="installed" className="cursor-pointer">
                Instalados
              </TabsTrigger>
              <TabsTrigger value="available" className="cursor-pointer">
                Disponíveis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="installed" className="mt-4 space-y-2">
              {plugins
                .filter((plugin) => plugin.installed)
                .map((plugin) => {
                  const isInstalling =
                    installationStatus[plugin.id] !== undefined
                  const isSelected = selectedPluginId === plugin.id
                  return (
                    <Card
                      key={plugin.id}
                      onClick={() =>
                        plugin.installed &&
                        onSelectDataSource(isSelected ? null : plugin)
                      }
                      className={`flex w-full items-start gap-3 p-2 transition-colors ${
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
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {plugin.name}
                            </p>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                              v{plugin.version}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              <span className="font-normal">by</span>{' '}
                              {plugin.creator}
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {plugin.path}
                              <div className="mt-1 flex gap-1">
                                {plugin.tags?.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="cursor-zoom-in tracking-tight shadow"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
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
                            ) : (
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
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
            </TabsContent>

            <TabsContent value="available" className="mt-4 space-y-2">
              {plugins
                .filter((plugin) => !plugin.installed)
                .map((plugin) => {
                  const isInstalling =
                    installationStatus[plugin.id] !== undefined
                  return (
                    <Card
                      key={plugin.id}
                      className="hover:bg-muted flex w-full cursor-pointer items-start gap-3 p-2 transition-colors"
                    >
                      <img
                        src={plugin.logo}
                        alt={plugin.name}
                        className="h-10 w-10 rounded-lg border bg-white object-contain p-1"
                      />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {plugin.name}
                            </p>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                              v{plugin.version}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              <span className="font-normal">by</span>{' '}
                              {plugin.creator}
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {plugin.path}
                              <div className="mt-1 flex gap-1">
                                {plugin.tags?.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="cursor-zoom-in tracking-tight shadow"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
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
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-0 rounded-sm p-2 text-xs"
                                onClick={() => {
                                  openInstallerModal(plugin)
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
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </>
  )
}
