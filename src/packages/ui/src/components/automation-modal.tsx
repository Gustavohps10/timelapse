'use client'

import {
  ArrowRightLeft,
  Icon as LucideIcon,
  MoveRight,
  Plus,
  Rocket,
  SquarePlus,
  Timer,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

const TRIGGERS = [
  { id: 'onLoadTasks', label: 'Quando carregar tarefas', icon: 'Rocket' },
  {
    id: 'onStatusChanged',
    label: 'Quando mudar de coluna',
    icon: 'ArrowRightLeft',
  },
  { id: 'onTaskCreated', label: 'Quando tarefa for criada', icon: 'Plus' },
]

const FIELDS = [
  { id: 'status', label: 'Status' },
  { id: 'columnId', label: 'Coluna' },
  { id: 'priority', label: 'Prioridade' },
]

const OPERATORS = [
  { id: 'equals', label: 'é igual a' },
  { id: 'notEquals', label: 'não é igual a' },
  { id: 'contains', label: 'contém' },
]

const ACTIONS = [
  { id: 'createCard', label: 'Criar card', icon: 'SquarePlus' },
  { id: 'startTimer', label: 'Iniciar timer', icon: 'Timer' },
  { id: 'moveToColumn', label: 'Mover para coluna', icon: 'MoveRight' },
]

const COLUMNS = [
  { id: 'pendentes', label: 'Pendentes' },
  { id: 'em_progresso', label: 'Em progresso' },
  { id: 'concluido', label: 'Concluído' },
]

type Condition = {
  id: string
  field: string
  operator: string
  value: string
}

type ActionItem = {
  id: string
  type: string
  params: Record<string, any>
}

type Automation = {
  id: string
  trigger: string
  conditions: Condition[]
  actions: ActionItem[]
  enabled: boolean
}

function iconMap(name: string) {
  const map: Record<string, any> = {
    Rocket,
    ArrowRightLeft,
    Plus,
    SquarePlus,
    Timer,
    MoveRight,
  }
  return map[name] || LucideIcon
}

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export default function AutomationModal() {
  const [open, setOpen] = useState<boolean>(false)
  const [automation, setAutomation] = useState<Automation>(() => ({
    id: uid('auto'),
    trigger: 'onLoadTasks',
    conditions: [],
    actions: [],
    enabled: true,
  }))

  const triggerOptions = useMemo(() => TRIGGERS, [])
  const fieldOptions = useMemo(() => FIELDS, [])
  const operatorOptions = useMemo(() => OPERATORS, [])
  const actionOptions = useMemo(() => ACTIONS, [])
  const columnOptions = useMemo(() => COLUMNS, [])

  function setTrigger(value: string) {
    setAutomation((prev) => ({ ...prev, trigger: value }))
  }

  function toggleEnabled() {
    setAutomation((prev) => ({ ...prev, enabled: !prev.enabled }))
  }

  function addCondition() {
    const newCondition: Condition = {
      id: uid('cond'),
      field: 'status',
      operator: 'equals',
      value: 'A Fazer',
    }
    setAutomation((prev) => ({
      ...prev,
      conditions: [...prev.conditions, newCondition],
    }))
  }

  function updateCondition(id: string, patch: Partial<Condition>) {
    setAutomation((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    }))
  }

  function removeCondition(id: string) {
    setAutomation((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }))
  }

  function addAction() {
    const newAction: ActionItem = {
      id: uid('act'),
      type: 'createCard',
      params: { columnId: 'pendentes' },
    }
    setAutomation((prev) => ({
      ...prev,
      actions: [...prev.actions, newAction],
    }))
  }

  function updateAction(id: string, patch: Partial<ActionItem>) {
    setAutomation((prev) => ({
      ...prev,
      actions: prev.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }))
  }

  function removeAction(id: string) {
    setAutomation((prev) => ({
      ...prev,
      actions: prev.actions.filter((a) => a.id !== id),
    }))
  }

  function handleSave() {
    console.log('automation', automation)
    setOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">Nova Automação</Button>
        </DialogTrigger>
        <DialogContent className="w-auto p-6">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-foreground text-2xl font-medium">
                  Nova Automação
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1 text-sm">
                  Defina um gatilho, condições e ações.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground text-sm">Ativa</Label>
                <Switch
                  checked={automation.enabled}
                  onCheckedChange={toggleEnabled}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <div className="border-border border p-5">
              <div className="flex items-center gap-4">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
                  {React.createElement(
                    iconMap(
                      TRIGGERS.find((t) => t.id === automation.trigger)?.icon ||
                        'Rocket',
                    ),
                    { className: 'w-5 h-5 text-foreground' },
                  )}
                </div>
                <div className="flex-1">
                  <Label className="text-muted-foreground text-sm">
                    Quando isso acontecer...
                  </Label>
                  <Select
                    onValueChange={setTrigger}
                    defaultValue={automation.trigger}
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Escolha um gatilho" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id}
                          className="flex items-center gap-2"
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center">
                            {React.createElement(iconMap(t.icon), {
                              className: 'w-4 h-4',
                            })}
                          </span>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-border rounded-2xl border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground text-sm">
                    Condições (opcional)
                  </Label>
                  <div className="text-muted-foreground text-sm">
                    Adicione regras para filtrar quando a automação deve rodar.
                  </div>
                </div>
                <Button variant="ghost" onClick={addCondition}>
                  Adicionar condição
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {automation.conditions.map((cond) => (
                  <div
                    key={cond.id}
                    className="flex items-center gap-3 rounded-xl border p-4"
                  >
                    <div className="w-56">
                      <Label className="text-muted-foreground text-xs">
                        Campo
                      </Label>
                      <Select
                        defaultValue={cond.field}
                        onValueChange={(v) =>
                          updateCondition(cond.id, { field: v })
                        }
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder="Campo" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-40">
                      <Label className="text-muted-foreground text-xs">
                        Operador
                      </Label>
                      <Select
                        defaultValue={cond.operator}
                        onValueChange={(v) =>
                          updateCondition(cond.id, { operator: v })
                        }
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder="Operador" />
                        </SelectTrigger>
                        <SelectContent>
                          {operatorOptions.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Label className="text-muted-foreground text-xs">
                        Valor
                      </Label>
                      {cond.field === 'status' ? (
                        <Select
                          defaultValue={cond.value}
                          onValueChange={(v) =>
                            updateCondition(cond.id, { value: v })
                          }
                        >
                          <SelectTrigger className="mt-2 w-full">
                            <SelectValue placeholder="Valor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A Fazer">A Fazer</SelectItem>
                            <SelectItem value="Em Progresso">
                              Em Progresso
                            </SelectItem>
                            <SelectItem value="Concluída">Concluída</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={cond.value}
                          onChange={(e) =>
                            updateCondition(cond.id, { value: e.target.value })
                          }
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div className="ml-2 flex items-center gap-2">
                      <Button
                        variant="link"
                        onClick={() => removeCondition(cond.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-border rounded-2xl border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground text-sm">Ações</Label>
                  <div className="text-muted-foreground text-sm">
                    O que deve acontecer quando as condições forem atendidas.
                  </div>
                </div>
                <Button variant="ghost" onClick={addAction}>
                  Adicionar ação
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {automation.actions.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center gap-3 rounded-xl border p-4"
                  >
                    <div className="w-56">
                      <Label className="text-muted-foreground text-xs">
                        Ação
                      </Label>
                      <Select
                        defaultValue={act.type}
                        onValueChange={(v) =>
                          updateAction(act.id, {
                            type: v,
                            params:
                              v === 'createCard' || v === 'moveToColumn'
                                ? { columnId: 'pendentes' }
                                : {},
                          })
                        }
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder="Ação" />
                        </SelectTrigger>
                        <SelectContent>
                          {actionOptions.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      {act.type === 'createCard' && (
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Coluna
                          </Label>
                          <Select
                            defaultValue={act.params.columnId}
                            onValueChange={(v) =>
                              updateAction(act.id, {
                                params: { ...act.params, columnId: v },
                              })
                            }
                          >
                            <SelectTrigger className="mt-2 w-full">
                              <SelectValue placeholder="Coluna" />
                            </SelectTrigger>
                            <SelectContent>
                              {columnOptions.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {act.type === 'moveToColumn' && (
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Destino
                          </Label>
                          <Select
                            defaultValue={act.params.columnId}
                            onValueChange={(v) =>
                              updateAction(act.id, {
                                params: { ...act.params, columnId: v },
                              })
                            }
                          >
                            <SelectTrigger className="mt-2 w-full">
                              <SelectValue placeholder="Coluna" />
                            </SelectTrigger>
                            <SelectContent>
                              {columnOptions.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {act.type === 'startTimer' && (
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Duração (min) — opcional
                          </Label>
                          <Input
                            type="number"
                            value={act.params.duration ?? ''}
                            onChange={(e) =>
                              updateAction(act.id, {
                                params: {
                                  ...act.params,
                                  duration: Number(e.target.value),
                                },
                              })
                            }
                            className="mt-2"
                          />
                        </div>
                      )}
                    </div>

                    <div className="ml-2 flex items-center gap-2">
                      <Button
                        variant="link"
                        onClick={() => removeAction(act.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar automação</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
