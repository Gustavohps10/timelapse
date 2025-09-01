import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { FieldGroup } from '@/client'
import { DataSource, DataSourceList } from '@/components/plugins-list'
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

const baseWorkspaceSettingsSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  description: z.string().optional(),
  defaultHourlyRate: z.coerce.number().optional(),
  currency: z.string().optional(),
  weeklyHourGoal: z.coerce.number().optional(),
  dataSource: z.custom<DataSource>().nullable().optional(),
})

function buildDataSourceSchemas(dynamicFields: {
  credentials: FieldGroup[]
  configuration: FieldGroup[]
}) {
  const createShapeFromGroups = (groups: FieldGroup[]) => {
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

  const credentialsSchema = createShapeFromGroups(dynamicFields.credentials)
  const configurationSchema = createShapeFromGroups(dynamicFields.configuration)

  return { credentialsSchema, configurationSchema }
}

export function WorkspaceSettings() {
  const { login } = useAuth()
  const client = useClient()
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [dynamicFields, setDynamicFields] = useState<{
    credentials: FieldGroup[]
    configuration: FieldGroup[]
  }>({ credentials: [], configuration: [] })
  const [dataSourceToLink, setDataSourceToLink] = useState<DataSource | null>(
    null,
  )

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
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceSettingsSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'Meu Projeto',
      description: '',
      currency: 'BRL',
      dataSource: null,
      credentials: {},
      configuration: {},
    },
  })

  const selectedDataSource = watch('dataSource')

  useEffect(() => {
    const loadDataSourceFields = async () => {
      if (!selectedDataSource) {
        setDynamicFields({ credentials: [], configuration: [] })
        reset((formValues) => ({
          ...formValues,
          credentials: {},
          configuration: {},
        }))
        return
      }

      const response = await client.services.workspaces.getDataSourceFields()
      setDynamicFields(response)
    }

    loadDataSourceFields()
  }, [selectedDataSource, client, reset])

  const onSubmit = async (data: WorkspaceSettingsSchema) => {
    if (!workspaceId) {
      toast.error('ID do Workspace não encontrado.')
      return
    }

    if (data.dataSource) {
      const response = await client.services.workspaces.connectDataSource({
        body: {
          workspaceId,
          credentials: data.credentials,
          configuration: data.configuration,
        },
      })

      if (!response.isSuccess) {
        toast.error(response.error ?? 'Falha ao conectar a fonte de dados.')
        return
      }

      toast.success(
        `Fonte de dados "${data.dataSource.name}" conectada com sucesso!`,
      )
      if (response.data?.member && response.data?.token) {
        login(response.data.member, response.data.token)
      }
    } else {
      toast.success('Alterações salvas com sucesso!')
    }
  }

  const handleDisconnect = async () => {
    const result = await client.services.workspaces.unlinkDataSource({
      body: {
        workspaceId: workspaceId!,
      },
    })

    if (!result.isSuccess) {
      toast.error(result.error ?? 'Falha ao desvincular a fonte de dados.')
      return
    }

    setValue('dataSource', null)
    toast.info('Fonte de dados desvinculada.')
  }

  const handleConfirmDataSourceLink = async () => {
    if (dataSourceToLink) {
      const result = await client.services.workspaces.linkDataSource({
        body: {
          workspaceId: workspaceId!,
          dataSource: dataSourceToLink.id,
        },
      })

      if (!result.isSuccess) {
        toast.error(result.error ?? 'Falha ao vincular a fonte de dados.')
        return
      }

      setValue('dataSource', dataSourceToLink, { shouldValidate: true })
      toast.success(`Configurando a fonte de dados: ${dataSourceToLink.name}!`)
    }
    setDataSourceToLink(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-12">
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integração</CardTitle>
            <CardDescription>
              Vincule a um serviço externo para sincronizar os dados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedDataSource ? (
              <>
                <DataSourceList
                  onSelectDataSource={(dataSource) =>
                    setDataSourceToLink(dataSource)
                  }
                />
                <AlertDialog
                  open={!!dataSourceToLink}
                  onOpenChange={(isOpen) =>
                    !isOpen && setDataSourceToLink(null)
                  }
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar vinculação</AlertDialogTitle>
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
                              por {dataSourceToLink?.creator}
                            </p>
                          </div>
                        </div>
                        <br />
                        Você está prestes a vincular este workspace a um
                        conector externo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        type="button"
                        onClick={() => setDataSourceToLink(null)}
                      >
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        type="button"
                        onClick={handleConfirmDataSourceLink}
                      >
                        Sim, vincular
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <img
                        src={selectedDataSource.logo}
                        alt={selectedDataSource.name}
                        className="h-10 w-10 rounded-lg border bg-white object-contain p-1"
                      />
                      <div>
                        <p className="leading-4 font-semibold">
                          {selectedDataSource.name}
                        </p>
                        <p className="text-muted-foreground text-sm leading-4">
                          por {selectedDataSource.creator}
                        </p>
                      </div>
                    </div>
                    <Badge className="flex w-fit items-center gap-1 rounded-md border-green-600 bg-green-100 px-2 py-1 text-green-600 dark:border-green-400 dark:bg-transparent dark:text-green-400">
                      <CheckCircle2 size={16} className="stroke-[3]" />
                      Vinculado
                    </Badge>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" type="button">
                        Desvincular
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação é irreversível. Desvincular este workspace
                          irá{' '}
                          <strong>
                            apagar permanentemente todos os dados locais
                          </strong>{' '}
                          (apontamentos, tarefas, etc.) associados a ele. O
                          workspace voltará ao estado "local-only".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel type="button">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          type="button"
                          onClick={handleDisconnect}
                        >
                          Sim, desvincular e apagar dados
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="mt-4 space-y-8 border-t pt-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Conectar com {selectedDataSource.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Preencha as configurações e suas credenciais de acesso
                      para vincular este workspace.
                    </p>
                  </div>

                  {dynamicFields.configuration.map((group) => (
                    <div key={group.id} className="space-y-4">
                      <div>
                        <h4 className="font-medium">{group.label}</h4>
                        {group.description && (
                          <p className="text-muted-foreground text-sm">
                            {group.description}
                          </p>
                        )}
                      </div>

                      {group.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          <Input
                            id={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            {...register(`configuration.${field.id}` as const)}
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
                      <div>
                        <h4 className="font-medium">{group.label}</h4>
                        {group.description && (
                          <p className="text-muted-foreground text-sm">
                            {group.description}
                          </p>
                        )}
                      </div>

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
                              {errors.credentials[field.id]?.message as string}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting
          ? 'Salvando...'
          : selectedDataSource
            ? 'Salvar e Conectar'
            : 'Salvar Alterações'}
      </Button>
    </form>
  )
}
