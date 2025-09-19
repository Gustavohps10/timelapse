import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AddonManifest, FieldGroup } from '@timelapse/application'
import {
  CheckCircle2,
  DatabaseZapIcon,
  UnlinkIcon,
  UnplugIcon,
  UploadIcon,
  UserCogIcon,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { FileUploadButton } from '@/components'
import { DataSourceList } from '@/components/plugins-list'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks'
import { useClient } from '@/hooks/use-client'
import { queryClient } from '@/lib'

const baseWorkspaceSettingsSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  description: z.string().optional(),
  defaultHourlyRate: z.coerce.number().optional(),
  currency: z.string().optional(),
  weeklyHourGoal: z.coerce.number().optional(),
  dataSource: z.custom<AddonManifest>().nullable().optional(),
})

function buildDataSourceSchemas(dynamicFields: {
  credentials: FieldGroup[]
  configuration: FieldGroup[]
}) {
  const createShapeFromGroups = (groups: FieldGroup[]): z.ZodObject<any> => {
    const shape: Record<string, z.ZodTypeAny> = {}
    if (!groups) return z.object(shape)

    for (const group of groups) {
      for (const field of group.fields) {
        let fieldSchema: z.ZodString = z.string()
        if (field.type === 'url') {
          fieldSchema = fieldSchema.url('URL inválida')
        }
        if (field.required) {
          shape[field.id] = fieldSchema.min(1, `${field.label} é obrigatório.`)
        } else {
          shape[field.id] = fieldSchema.optional().nullable()
        }
      }
    }
    return z.object(shape)
  }

  return {
    credentialsSchema: createShapeFromGroups(dynamicFields.credentials),
    configurationSchema: createShapeFromGroups(dynamicFields.configuration),
  }
}

export function WorkspaceSettings() {
  const { login, logout, isAuthenticated, user } = useAuth()
  const client = useClient()
  const { workspaceId } = useParams<{ workspaceId: string }>()

  const workspaceQueryKey = ['workspace', workspaceId]

  const { data: workspace, isLoading } = useQuery({
    queryKey: workspaceQueryKey,
    queryFn: async () => {
      if (!workspaceId) return null
      const response = await client.services.workspaces.getById({
        body: { workspaceId },
      })
      return response.data ?? null
    },
    enabled: !!workspaceId,
  })

  const { data: localAddon, isLoading: localPluginIsLoading } = useQuery({
    queryKey: ['local-addon', workspaceId, workspace?.dataSource],
    queryFn: async () => {
      if (!workspaceId || !workspace?.dataSource) return null
      const response = await client.integrations.addons.getInstalledById({
        body: { addonId: workspace.dataSource },
      })
      return response.data ?? null
    },
    enabled: !!workspaceId && !!workspace?.dataSource,
  })

  console.log(localAddon)

  const [dynamicFields, setDynamicFields] = useState<{
    credentials: FieldGroup[]
    configuration: FieldGroup[]
  }>({ credentials: [], configuration: [] })
  const [dataSourceToLink, setDataSourceToLink] =
    useState<AddonManifest | null>(null)

  const formSchema = useMemo(() => {
    const { credentialsSchema, configurationSchema } =
      buildDataSourceSchemas(dynamicFields)
    return baseWorkspaceSettingsSchema.extend({
      credentials: credentialsSchema,
      configuration: configurationSchema,
    })
  }, [dynamicFields])

  type WorkspaceSettingsSchema = z.infer<typeof formSchema>

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<WorkspaceSettingsSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', currency: '' },
  })

  useEffect(() => {
    if (!workspace) return
    reset({
      name: workspace.name,
      description: '',
      currency: '',
      defaultHourlyRate: undefined,
      weeklyHourGoal: undefined,
      dataSource: undefined,
      configuration: workspace.dataSourceConfiguration,
      credentials: {},
    })
  }, [workspace, reset])

  const selectedDataSource = watch('dataSource')

  useEffect(() => {
    const loadDataSourceFields = async () => {
      const response = await client.services.workspaces.getDataSourceFields()
      setDynamicFields(response)
    }
    loadDataSourceFields()
  }, [selectedDataSource, client])

  const linkMutation = useMutation({
    mutationFn: (dataSource: AddonManifest) => {
      return client.services.workspaces.linkDataSource({
        body: { workspaceId: workspaceId!, dataSource: dataSource.id },
      })
    },
    onSuccess: (_, dataSource) => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKey })
      queryClient.invalidateQueries({
        queryKey: ['local-addon', workspaceId, dataSource.id],
      })
      toast.success(`Fonte de dados "${dataSource.name}" vinculada!`)
      setDataSourceToLink(null)
    },
    onError: (error) => {
      toast.error(error.message)
      setDataSourceToLink(null)
    },
  })

  const unlinkMutation = useMutation({
    mutationFn: () => {
      return client.services.workspaces.unlinkDataSource({
        body: { workspaceId: workspaceId! },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKey })
      queryClient.invalidateQueries({ queryKey: ['local-addon', workspaceId] })
      toast.info('Fonte de dados desvinculada.')
      logout()
    },
    onError: (error) => toast.error(error.message),
  })
  const connectMutation = useMutation({
    mutationFn: (data: WorkspaceSettingsSchema) => {
      return client.services.workspaces.connectDataSource({
        body: {
          workspaceId: workspaceId!,
          credentials: data.credentials,
          configuration: data.configuration,
        },
      })
    },
    onSuccess: (response, variables) => {
      if (!response.isSuccess) {
        toast.error(response.error ?? 'Falha ao conectar.')
        return
      }
      queryClient.invalidateQueries({ queryKey: workspaceQueryKey })
      queryClient.invalidateQueries({
        queryKey: ['workspace-addon', workspaceId],
      })
      toast.success(
        `Conectado com "${variables.dataSource?.name}" com sucesso!`,
      )
      if (response.data?.member && response.data?.token) {
        login(response.data.member, response.data.token)
      }
    },
    onError: (error) => toast.error(error.message),
  })

  const disconnectMutation = useMutation({
    mutationFn: () => {
      return client.services.workspaces.disconnectDataSource({
        body: { workspaceId: workspaceId! },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKey })
      toast.info('Desconectado com sucesso.')
      logout()
    },
    onError: (error) => toast.error(error.message),
  })

  async function handleDataSourceImport(files: FileList) {
    const file = files[0]
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const response = await client.integrations.addons.import({
      body: { addon: uint8Array },
    })

    if (!response.isSuccess) {
      toast.error('Falha ao importar: ' + response.error)
      return
    }

    toast.success('Importado com sucesso.')
  }

  if (isLoading) {
    return <div>Carregando workspace...</div>
  }

  return (
    <form
      onSubmit={handleSubmit((data) => connectMutation.mutate(data))}
      className="space-y-6 pb-12"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Configurações do Workspace
        </h2>
        <p className="text-muted-foreground">
          Gerencie as informações gerais e integrações do seu workspace.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
            <CardDescription>
              Detalhes básicos do seu espaço de trabalho.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Workspace</Label>
              <Input
                id="name"
                placeholder="Ex: Minha Empresa"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o propósito deste workspace."
                {...register('description')}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultHourlyRate">Valor Hora Padrão</Label>
                <Input
                  id="defaultHourlyRate"
                  type="number"
                  step="0.01"
                  {...register('defaultHourlyRate')}
                />
              </div>
              <div className="space-y-2">
                <Label>Moeda</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (BRL)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyHourGoal">Meta de Horas Semanal</Label>
              <Input
                id="weeklyHourGoal"
                type="number"
                {...register('weeklyHourGoal')}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button">Salvar Alterações</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1">
              <DatabaseZapIcon size={20} /> Provedor de dados
            </CardTitle>
            <CardDescription>
              Vincule a um serviço externo para sincronizar os dados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!workspace?.dataSource ||
              (workspace?.dataSource == 'local' && (
                <>
                  <FileUploadButton
                    size="sm"
                    accept=".tladdon"
                    onFileSelect={(files) => {
                      handleDataSourceImport(files)
                    }}
                  >
                    <UploadIcon />
                    Importar
                  </FileUploadButton>
                  <DataSourceList
                    onSelectDataSource={(ds) => setDataSourceToLink(ds)}
                  />
                  <AlertDialog
                    open={!!dataSourceToLink}
                    onOpenChange={(isOpen) =>
                      !isOpen && setDataSourceToLink(null)
                    }
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirmar vinculação
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <div className="flex items-center gap-3">
                            <img
                              src={dataSourceToLink?.logo}
                              alt={dataSourceToLink?.name}
                              className="h-10 w-10 rounded-lg border bg-white object-contain p-1"
                            />
                            <div>
                              <p className="font-semibold">
                                {dataSourceToLink?.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                <span className="text-xs font-semibold">
                                  <span className="font-normal">by</span>{' '}
                                  {dataSourceToLink?.creator}
                                </span>
                              </p>
                            </div>
                          </div>
                          <br />
                          Você está prestes a vincular este workspace a um
                          provedor de dados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={linkMutation.isPending}
                          onClick={() =>
                            dataSourceToLink &&
                            linkMutation.mutate(dataSourceToLink)
                          }
                        >
                          {linkMutation.isPending
                            ? 'Vinculando...'
                            : 'Sim, vincular'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ))}

            {workspace?.dataSource && workspace?.dataSource != 'local' && (
              <div>
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <img
                        src={localAddon?.logo}
                        alt={localAddon?.name}
                        className="h-10 w-10 rounded-lg border bg-white object-contain p-1"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {localAddon?.name}
                          </p>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            v{localAddon?.version}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-normal">by</span>{' '}
                          {localAddon?.creator}
                        </span>
                      </div>
                    </div>
                    <Badge className="flex w-fit items-center gap-1 rounded-md border-green-600 bg-green-100 px-2 py-1 text-green-600 dark:bg-transparent">
                      <CheckCircle2 size={16} className="stroke-[3]" />
                      Vinculado
                    </Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" type="button">
                        Desvincular <UnlinkIcon />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação é irreversível e irá desvincular seu
                          provedor de dados
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={unlinkMutation.isPending}
                          onClick={() => unlinkMutation.mutate()}
                        >
                          Sim, desvincular
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {isAuthenticated && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    {workspace?.dataSourceConfiguration &&
                      dynamicFields.configuration.length > 0 && (
                        <div className="rounded-md border p-4">
                          <h4 className="mb-2 flex items-center gap-1 font-semibold tracking-tighter">
                            <UserCogIcon size={20} /> Sessão Ativa
                          </h4>
                          <ul className="list-none space-y-1 pl-5 text-sm">
                            {dynamicFields.configuration
                              .flatMap((group) => group.fields)
                              .map((field) => {
                                const value =
                                  workspace?.dataSourceConfiguration?.[field.id]

                                if (!value) return null

                                return (
                                  <li key={field.id}>
                                    <strong className="font-semibold tracking-tighter text-zinc-700 dark:text-zinc-500">
                                      {field.label}:
                                    </strong>{' '}
                                    <span className="font-mono tracking-tight">{`${String(value)}`}</span>
                                  </li>
                                )
                              })}
                            <li>
                              <strong className="font-semibold tracking-tighter text-zinc-700 dark:text-zinc-500">
                                ID:
                              </strong>{' '}
                              <span className="font-mono tracking-tight">
                                {user?.id}
                              </span>
                            </li>
                            <li>
                              <strong className="font-semibold tracking-tighter text-zinc-700 dark:text-zinc-500">
                                Nome:
                              </strong>{' '}
                              <span className="font-mono tracking-tight">
                                {user?.firstname} {user?.lastname}
                              </span>
                            </li>
                            <li>
                              <strong className="font-semibold tracking-tighter text-zinc-700 dark:text-zinc-500">
                                Login:
                              </strong>{' '}
                              <span className="font-mono tracking-tight">
                                {user?.login}
                              </span>
                            </li>
                          </ul>
                        </div>
                      )}

                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => disconnectMutation.mutate()}
                      disabled={disconnectMutation.isPending}
                      className="ml-auto"
                    >
                      {disconnectMutation.isPending
                        ? 'Desconectando...'
                        : 'Desconectar'}
                      <UnplugIcon />
                    </Button>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="mt-4 space-y-8 border-t pt-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Conectar com {localAddon?.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Preencha suas credenciais.
                      </p>
                    </div>

                    {dynamicFields.configuration.map((group) => (
                      <div key={group.id} className="space-y-4">
                        <h4 className="font-medium">{group.label}</h4>
                        {group.fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>{field.label}</Label>
                            <Input
                              id={field.id}
                              type={field.type}
                              placeholder={field.placeholder}
                              {...register(
                                `configuration.${field.id}` as const,
                              )}
                              required={field.required}
                            />
                            {errors.configuration?.[field.id] && (
                              <p className="text-sm text-red-500">
                                {
                                  errors.configuration[field.id]
                                    ?.message as string
                                }
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}

                    {dynamicFields.credentials.map((group) => (
                      <div key={group.id} className="space-y-4">
                        <h4 className="font-medium">{group.label}</h4>
                        {group.fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>{field.label}</Label>
                            <Input
                              id={field.id}
                              type={field.type}
                              placeholder={field.placeholder}
                              {...register(`credentials.${field.id}` as const)}
                              required={field.required}
                            />
                            {errors.credentials?.[field.id] && (
                              <p className="text-sm text-red-500">
                                {
                                  errors.credentials[field.id]
                                    ?.message as string
                                }
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    <Button
                      type="submit"
                      disabled={connectMutation.isPending || isFormSubmitting}
                    >
                      {connectMutation.isPending ? 'Conectando...' : 'Conectar'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
