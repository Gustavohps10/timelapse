import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Search, Upload } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

import { PluginList } from '@/components/plugins-list'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome precisa ter no mínimo 3 caracteres.' }),
  description: z.string().optional(),
  defaultHourlyRate: z.coerce.number().optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  weeklyHourGoal: z.coerce.number().optional(),
  pluginId: z.string().optional(),
})

type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>

export function NewWorkspaceDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const client = useClient()

  const {
    control,
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateWorkspaceSchema>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      currency: 'BRL',
    },
  })

  const selectedPluginId = watch('pluginId')

  const createWorkspaceMutation = useMutation({
    mutationFn: (data: CreateWorkspaceSchema) =>
      client.workspaces.create({
        body: {
          name: data.name,
          pluginId: data?.pluginId,
          pluginConfig: 'CONFIGURACAO GENERICA',
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Workspace criado com sucesso.')
      setIsOpen(false)
      reset()
    },
    onError: (error: Error) => {
      toast.error('Falha ao criar o workspace.', {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: CreateWorkspaceSchema) => {
    console.log('Form data submitted:', data)
    createWorkspaceMutation.mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Novo Workspace</DialogTitle>
          <DialogDescription>
            Configure os detalhes do seu novo espaço de trabalho.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <Tabs defaultValue="geral" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="bg-muted rounded-md p-1">
              <TabsTrigger value="geral" className="px-3 py-1 text-sm">
                Geral
              </TabsTrigger>
              <TabsTrigger value="advanced" className="px-3 py-1 text-sm">
                Avançado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="mt-4 flex-1 space-y-4">
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

            <TabsContent
              value="advanced"
              className="flex min-h-0 flex-1 flex-col space-y-4 py-4"
            >
              <div className="shrink-0 space-y-2">
                <Label>Vincular a um Serviço Externo</Label>
                <p className="text-muted-foreground text-sm">
                  Selecione um conector para sincronizar os dados.
                </p>
              </div>
              <div className="my-1 flex items-center gap-2">
                <div className="relative">
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Procurar"
                    className="bg-background w-32 pl-7 text-sm"
                  />
                </div>
                <Button className="h-9 text-sm" variant="secondary">
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                <PluginList
                  selectedPluginId={selectedPluginId}
                  onPluginSelected={(pluginId) => {
                    setValue('pluginId', pluginId || undefined, {
                      shouldValidate: true,
                    })
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
