import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { FieldGroup } from '@/client'
import { Plugin, PluginList } from '@/components/plugins-list'
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
import { useClient } from '@/hooks/use-client'

const workspaceSettingsSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  description: z.string().optional(),
  defaultHourlyRate: z.coerce.number().optional(),
  currency: z.string().optional(),
  weeklyHourGoal: z.coerce.number().optional(),
  plugin: z.custom<Plugin>().nullable().optional(),
  pluginConfig: z.record(z.string()).optional(),
})

type WorkspaceSettingsSchema = z.infer<typeof workspaceSettingsSchema>

export function buildPluginConfigSchema(groups: FieldGroup[]) {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const group of groups) {
    for (const field of group.fields) {
      let baseSchema = z.string()

      switch (field.type) {
        case 'url':
          baseSchema = baseSchema.url('URL inválida')
          break
        case 'password':
        case 'text':
        default:
          break
      }

      if (field.required) {
        baseSchema = baseSchema.min(1, 'Campo obrigatório')
        shape[field.id] = baseSchema
      } else {
        shape[field.id] = baseSchema.optional()
      }
    }
  }

  return z.object({
    pluginConfig: z.object(shape),
  })
}

export function WorkspaceSettings() {
  const client = useClient()
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [dynamicFields, setDynamicFields] = useState<FieldGroup[]>([])
  const [pluginToLink, setPluginToLink] = useState<Plugin | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceSettingsSchema>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      name: 'Meu Projeto',
      description: '',
      currency: 'BRL',
      plugin: null,
    },
  })

  const selectedPlugin = watch('plugin')

  const pluginSchema = useMemo(
    () => buildPluginConfigSchema(dynamicFields),
    [dynamicFields],
  )

  const {
    register: registerPluginForm,
    handleSubmit: handleSubmitPluginForm,
    formState: {
      errors: errorsPluginForm,
      isSubmitting: isSubmittingPluginForm,
    },
  } = useForm<z.infer<typeof pluginSchema>>({
    resolver: zodResolver(pluginSchema),
  })

  async function handleAuthenticate(data: z.infer<typeof pluginSchema>) {
    alert('AUTENTICANDO....')
  }

  useEffect(() => {
    if (!selectedPlugin) {
      setDynamicFields([])
      return
    }

    const loadPluginFields = async () => {
      const pluginFields = await client.workspaces.getPluginFields() /// FUTURAMENTE USAR O ID PARA PEGAR PELO NOME DA PASTA E ACESSAR O MODULO CORRESPONDENTE
      setDynamicFields(pluginFields)
    }

    loadPluginFields()
  }, [selectedPlugin])

  const onSubmit = async (data: WorkspaceSettingsSchema) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('DADOS DO FORMULÁRIO:', data)
    console.log('ID DO WORKSPACE:', workspaceId)
    toast.success('Alterações salvas com sucesso!')
  }

  const handleDisconnect = () => {
    setValue('plugin', null)
    setValue('pluginConfig', {})
    toast.info('Workspace desvinculado. Os dados locais foram resetados.')
  }

  const handleConfirmLink = () => {
    if (pluginToLink) {
      setValue('plugin', pluginToLink)
      toast.success(`Workspace vinculado com ${pluginToLink.name}!`)
    }
    setPluginToLink(null)
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Configurações do Workspace
        </h2>
        <p className="text-muted-foreground">
          Gerencie as informações gerais e integrações do seu workspace.
        </p>
      </div>

      <form className="space-y-6">
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
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
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
            {!selectedPlugin ? (
              <>
                <PluginList
                  onSelectPlugin={(plugin) => setPluginToLink(plugin)}
                />
                <AlertDialog
                  open={!!pluginToLink}
                  onOpenChange={(isOpen) => !isOpen && setPluginToLink(null)}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar vinculação</AlertDialogTitle>
                      <AlertDialogDescription>
                        <div className="flex items-center gap-3">
                          <img
                            src={pluginToLink?.logo}
                            alt={pluginToLink?.name}
                            className="h-10 w-10 rounded-lg border bg-white object-contain p-1"
                          />
                          <div>
                            <p className="font-semibold">
                              {pluginToLink?.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              por {pluginToLink?.creator}
                            </p>
                          </div>
                        </div>
                        <br />
                        Você está prestes a vincular este workspace a um
                        conector externo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setPluginToLink(null)}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfirmLink}>
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
                        src={selectedPlugin.logo}
                        alt={selectedPlugin.name}
                        className="h-10 w-10 rounded-lg border bg-white object-contain p-1"
                      />
                      <div>
                        <p className="leading-4 font-semibold">
                          {selectedPlugin.name}
                        </p>
                        <p className="text-muted-foreground text-sm leading-4">
                          por {selectedPlugin.creator}
                        </p>
                      </div>
                    </div>
                    <Badge className="flex items-center gap-1 rounded-md border-green-600 bg-green-100 px-2 py-1 text-green-600 dark:border-green-400 dark:bg-transparent dark:text-green-400">
                      <CheckCircle2 size={16} className="stroke-[3]" />
                      Vinculado
                    </Badge>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Desvincular
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação é irreversível. Desvincular este workspace
                          irá
                          <strong>
                            apagar permanentemente todos os dados locais
                          </strong>{' '}
                          (apontamentos, tarefas, etc.) associados a ele. O
                          workspace voltará ao estado "local-only".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisconnect}>
                          Sim, desvincular e apagar dados
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="mt-4 space-y-4 border-t pt-4">
                  <h3 className="font-medium">
                    Configuração do {selectedPlugin.name}
                  </h3>

                  {dynamicFields.map((group) => (
                    <div key={group.id} className="space-y-4">
                      <div>
                        <h4 className="font-semibold">{group.label}</h4>
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
                            {...registerPluginForm(
                              `pluginConfig.${field.id}` as const,
                            )}
                            required={field.required}
                          />
                          {errorsPluginForm?.pluginConfig?.[field.id] && (
                            <p className="text-sm text-red-500">
                              {
                                errorsPluginForm.pluginConfig[field.id]
                                  ?.message as string
                              }
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}

                  <Button onClick={handleSubmitPluginForm(handleAuthenticate)}>
                    Conectar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
