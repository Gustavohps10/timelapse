import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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
})

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>

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
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      currency: 'BRL',
    },
  })

  const { mutate } = useMutation({
    mutationFn: (data: CreateWorkspaceFormData) =>
      client.services.workspaces.create({ body: data }),
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

  const onSubmit = (data: CreateWorkspaceFormData) => {
    mutate(data)
  }

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      reset()
    }
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <DialogFooter className="pt-4">
              <Button
                variant="ghost"
                type="button"
                onClick={() => handleCloseDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Criando...' : 'Criar Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
