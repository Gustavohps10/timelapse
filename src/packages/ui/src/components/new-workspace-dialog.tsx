import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FieldGroup } from '@/client'
import { Plugin } from '@/components/plugins-list'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useClient } from '@/hooks/use-client'
import { queryClient } from '@/lib'

const baseCreateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome precisa ter no mínimo 3 caracteres.' }),
  description: z.string().optional(),
  defaultHourlyRate: z.coerce.number().optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  weeklyHourGoal: z.coerce.number().optional(),
  plugin: z.custom<Plugin>().nullable().optional(),
})

export function NewWorkspaceDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const client = useClient()

  const [pluginToLink, setPluginToLink] = useState<Plugin | null>(null)
  const [dynamicFields, setDynamicFields] = useState<FieldGroup[]>([])
  const [isLoadingFields, setIsLoadingFields] = useState(false)

  const finalWorkspaceSchema = useMemo(() => {
    const allFields = dynamicFields.flatMap((group) => group.fields)

    const pluginConfigShape = allFields.reduce(
      (shape, field) => {
        let fieldSchema: z.ZodString

        switch (field.type) {
          case 'url':
            fieldSchema = z.string().url({ message: 'URL inválida.' })
            break
          case 'text':
          case 'password':
          default:
            fieldSchema = z.string()
            break
        }

        if (field.required) {
          shape[field.id] = fieldSchema.min(1, 'Este campo é obrigatório.')
          return shape
        }

        shape[field.id] = fieldSchema.optional().or(z.literal(''))
        return shape
      },
      {} as Record<string, z.ZodTypeAny>,
    )

    return baseCreateWorkspaceSchema.extend({
      pluginConfig: z.object(pluginConfigShape).optional(),
    })
  }, [dynamicFields])

  type FinalWorkspaceSchema = z.infer<typeof finalWorkspaceSchema>

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FinalWorkspaceSchema>({
    resolver: zodResolver(finalWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      currency: 'BRL',
      plugin: null,
      pluginConfig: {},
    },
  })

  const selectedPlugin = watch('plugin')

  useEffect(() => {
    if (!selectedPlugin) {
      setDynamicFields([])
      return
    }

    const loadPluginFields = async () => {
      setIsLoadingFields(true)
      try {
        const fields = await client.workspaces.getPluginFields()
        setDynamicFields(fields)
      } catch {
        toast.error('Falha ao carregar campos do conector.')
        handleDisconnect()
      } finally {
        setIsLoadingFields(false)
      }
    }

    loadPluginFields()
  }, [selectedPlugin, client.workspaces])

  const createWorkspaceMutation = useMutation({
    mutationFn: (data: FinalWorkspaceSchema) =>
      client.workspaces.create({
        body: {
          name: data.name,
          pluginId: data.plugin?.id,
          pluginConfig: data.pluginConfig,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Workspace criado com sucesso.')
      handleCloseDialog(false)
    },
    onError: (error: Error) => {
      toast.error('Falha ao criar o workspace.', {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: FinalWorkspaceSchema) => {
    const { pluginConfig, ...restOfData } = data
    const allFields = dynamicFields.flatMap((group) => group.fields)
    const persistableFields = allFields.filter((field) => field.persistable)
    const persistablePluginConfig = persistableFields.reduce(
      (acc, field) => {
        if (
          pluginConfig &&
          Object.prototype.hasOwnProperty.call(pluginConfig, field.id)
        ) {
          acc[field.id] = pluginConfig[field.id]
        }
        return acc
      },
      {} as Record<string, any>,
    )

    createWorkspaceMutation.mutate({
      ...restOfData,
      pluginConfig: persistablePluginConfig,
    })
  }

  const handleConfirmLink = () => {
    if (pluginToLink) {
      setValue('plugin', pluginToLink, { shouldValidate: true })
      toast.success(`Conector ${pluginToLink.name} vinculado!`)
    }
    setPluginToLink(null)
  }

  const handleDisconnect = () => {
    setValue('plugin', null)
    setValue('pluginConfig', {})
    setDynamicFields([])
    toast.info('Conector desvinculado.')
  }

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      reset()
      setDynamicFields([])
      setPluginToLink(null)
    }
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="p-4">
            <DialogTitle>Novo Workspace</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <Tabs defaultValue="geral" className="flex flex-col">
              <TabsList>
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="conector">Conector</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="mt-4 space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Workspace</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Minha Empresa"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
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
                <div className="grid grid-cols-2 gap-4">
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4">
              <Button
                variant="ghost"
                type="button"
                onClick={() => handleCloseDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isSubmitting || isLoadingFields}
                onClick={handleSubmit(onSubmit)}
              >
                {(isSubmitting || isLoadingFields) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Criando...' : 'Criar Workspace'}
              </Button>
            </DialogFooter>
          </div>

          <AlertDialog
            open={!!pluginToLink}
            onOpenChange={(isOpen) => !isOpen && setPluginToLink(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar vinculação</AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a vincular este workspace ao conector{' '}
                  <strong>{pluginToLink?.name}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmLink}>
                  Sim, vincular
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
