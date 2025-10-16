'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  CircleX,
  ExternalLink,
  History,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  Timer,
  ZapIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { AutoComplete } from '@/components'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription, // Adicionado import
  DialogFooter, // Adicionado import
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label' // Adicionado import
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// --- 1. Definição de Tipos e Dados Fakes (Mantidos) ---

const statuses = [
  { value: 'new', label: 'Nova', icon: Timer },
  { value: 'in_progress', label: 'Em Andamento', icon: ZapIcon },
  { value: 'resolved', label: 'Resolvida', icon: CheckCircle2 },
  { value: 'closed', label: 'Fechada', icon: CircleX },
]

const priorities = [
  { value: 'low', label: 'Baixa', icon: ArrowDown },
  { value: 'normal', label: 'Normal', icon: ArrowRight },
  { value: 'high', label: 'Alta', icon: ArrowUp },
]

type Journal = { id: number; user: string; notes: string; created_on: Date }
type Task = {
  id: string
  redmineUrl?: string
  title: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high'
  author?: string
  timerStatus: 'running' | 'paused' | null
  timeSpent: number
  journals: Journal[]
}

const initialTasks: Task[] = [
  {
    id: '87821',
    redmineUrl: 'https://redmine.example.com/issues/87821',
    title: 'Implementar autenticação OAuth2 com Discord',
    status: 'in_progress',
    priority: 'high',
    timerStatus: 'running',
    timeSpent: 5432,
    journals: [
      {
        id: 1,
        user: 'Eduardo P',
        notes: 'Status alterado para: Em Andamento',
        created_on: new Date('2025-10-15T14:00:00Z'),
      },
      {
        id: 2,
        user: 'Eduardo P',
        notes: 'Atribuído alterado para: Eduardo P',
        created_on: new Date('2025-10-15T13:59:00Z'),
      },
    ],
  },
  {
    id: '55142',
    redmineUrl: 'https://redmine.example.com/issues/55142',
    title: 'Refatorar componente de importação de planilhas',
    status: 'in_progress',
    priority: 'normal',
    timerStatus: 'paused',
    timeSpent: 1250,
    journals: [
      {
        id: 3,
        user: 'Eduardo P',
        notes: 'Status alterado para: Pausada',
        created_on: new Date('2025-10-15T10:00:00Z'),
      },
    ],
  },
  {
    id: '76543',
    redmineUrl: 'https://redmine.example.com/issues/76543',
    title: 'Otimizar query SQL de relatório de produtividade',
    status: 'resolved',
    priority: 'high',
    timerStatus: null,
    timeSpent: 8960,
    journals: [],
  },
  {
    id: 'INTERNA-01',
    title: 'Revisar Pull Request #125',
    status: 'new',
    priority: 'high',
    author: 'Eduardo P',
    timerStatus: null,
    timeSpent: 0,
    journals: [],
  },
  {
    id: '34324',
    redmineUrl: 'https://redmine.example.com/issues/34324',
    title: 'Corrigir bug na sincronização de dados offline',
    status: 'closed',
    priority: 'normal',
    timerStatus: null,
    timeSpent: 4200,
    journals: [
      {
        id: 8,
        user: 'João L',
        notes: 'Correção aplicada em produção. Tarefa fechada.',
        created_on: new Date('2025-10-10T12:00:00Z'),
      },
    ],
  },
]

const fakeRemoteTasks: Task[] = [
  {
    id: '99881',
    redmineUrl: 'https://redmine.example.com/issues/99881',
    title: 'Criar endpoint para relatório de usuários ativos',
    status: 'new',
    priority: 'high',
    timerStatus: null,
    timeSpent: 0,
    journals: [],
  },
  {
    id: '99882',
    redmineUrl: 'https://redmine.example.com/issues/99882',
    title: 'Migrar banco de dados de clientes para nova infraestrutura',
    status: 'in_progress',
    priority: 'high',
    timerStatus: null,
    timeSpent: 0,
    journals: [],
  },
]

function formatTime(seconds: number): string {
  if (seconds === 0) return ''
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedValue, setSelectedValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const localSearchResults = useMemo(() => {
    if (!searchTerm) return []
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm, tasks])

  const remoteSearchResults = useMemo(() => {
    if (!searchTerm) return []
    return fakeRemoteTasks.filter(
      (remoteTask) =>
        !tasks.some((localTask) => localTask.id === remoteTask.id) &&
        (remoteTask.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          remoteTask.id.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [searchTerm, tasks])

  const autoCompleteItems = useMemo(() => {
    const localItems = localSearchResults.map((task) => ({
      value: task.id,
      label: task.title,
    }))
    const remoteItems = remoteSearchResults.map((task) => ({
      value: task.id,
      label: task.title,
    }))
    return [...localItems, ...remoteItems]
  }, [localSearchResults, remoteSearchResults])

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, tasks])

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE)

  const handleTrackTask = (remoteTask: Task) => {
    setTasks((prev) => [remoteTask, ...prev])
    setSearchTerm('')
    setSelectedValue('')
  }

  const handleSelectTask = (taskId: string) => {
    if (!taskId) {
      setSelectedValue('')
      return
    }

    const remoteTask = remoteSearchResults.find((t) => t.id === taskId)
    if (remoteTask) {
      handleTrackTask(remoteTask)
    } else {
      setSelectedValue(taskId)
    }
  }

  const getStatusBadgeClass = (status: Task['status']) => {
    switch (status) {
      case 'resolved':
        return 'border border-green-500 text-green-500 bg-green-50 dark:border-green-400 dark:text-green-400 dark:bg-green-900/20'
      case 'closed':
        return 'bg-destructive text-destructive-foreground'
      case 'in_progress':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-200'
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-400/20 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-200'
    }
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Minhas Tarefas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="my-2 mb-4 scroll-m-20 text-2xl font-bold tracking-tight lg:text-3xl">
        Minhas Tarefas
      </h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-full max-w-sm flex-1">
              <AutoComplete
                selectedValue={selectedValue}
                onSelectedValueChange={handleSelectTask}
                searchValue={searchTerm}
                onSearchValueChange={setSearchTerm}
                items={autoCompleteItems}
                placeholder="Buscar ou rastrear ticket..."
                emptyMessage="Nenhum resultado encontrado."
              />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adicionar Tarefa Manual</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Tarefa Manualmente</DialogTitle>
                  <DialogDescription>
                    Adicione uma tarefa que não foi sincronizada do Redmine.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="taskId" className="text-right">
                      ID
                    </Label>
                    <Input
                      id="taskId"
                      placeholder="Ex: INTERNA-02"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="taskTitle" className="text-right">
                      Título
                    </Label>
                    <Input
                      id="taskTitle"
                      placeholder="Título da tarefa"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Ticket</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-[150px]">Status</TableHead>
                  <TableHead className="w-[120px]">Prioridade</TableHead>
                  <TableHead className="w-[180px]">Tempo Gasto</TableHead>
                  <TableHead className="w-[64px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.map((task) => {
                  const statusInfo = statuses.find(
                    (s) => s.value === task.status,
                  )
                  const priorityInfo = priorities.find(
                    (p) => p.value === task.priority,
                  )

                  return (
                    <Dialog key={task.id}>
                      <TableRow>
                        <TableCell className="py-1">
                          {task.redmineUrl ? (
                            <a
                              href={task.redmineUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 font-mono text-xs font-medium text-zinc-600 brightness-95 filter hover:underline dark:text-zinc-400 dark:brightness-105"
                            >
                              #{task.id}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-mono text-xs font-medium">
                              #{task.id}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 font-medium">
                          {task.title}
                        </TableCell>
                        <TableCell className="py-1">
                          <Badge
                            className={`flex w-fit items-center gap-2 ${getStatusBadgeClass(task.status)}`}
                          >
                            {statusInfo?.icon && (
                              <statusInfo.icon className="h-3 w-3" />
                            )}
                            {statusInfo?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1">
                          <div className="flex items-center gap-2">
                            {priorityInfo?.icon && (
                              <priorityInfo.icon className="text-muted-foreground h-4 w-4" />
                            )}
                            <span>{priorityInfo?.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-1 font-mono text-sm">
                          {task.timerStatus === 'running' && (
                            <Badge variant="default">
                              <PlayCircle className="mr-2 h-4 w-4" />
                              {formatTime(task.timeSpent)}
                            </Badge>
                          )}
                          {task.timerStatus === 'paused' && (
                            <Badge variant="outline">
                              <PauseCircle className="mr-2 h-4 w-4" />
                              {formatTime(task.timeSpent)}
                            </Badge>
                          )}
                          {task.timerStatus === null && task.timeSpent > 0 && (
                            <span>{formatTime(task.timeSpent)}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                aria-label="Abrir menu"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              {task.redmineUrl && (
                                <DropdownMenuItem asChild>
                                  <a
                                    href={task.redmineUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex cursor-pointer items-center"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Ver no Redmine
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DialogTrigger asChild>
                                <DropdownMenuItem>
                                  <History className="mr-2 h-4 w-4" />
                                  Ver Histórico
                                </DropdownMenuItem>
                              </DialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                          <DialogTitle>
                            Histórico da Tarefa #{task.id}
                          </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh]">
                          <div className="p-4">
                            {task.journals.length > 0 ? (
                              <div className="relative space-y-6">
                                <div className="bg-border absolute top-2 left-[7px] h-full w-px" />
                                {task.journals.map((journal) => (
                                  <div
                                    key={journal.id}
                                    className="relative flex gap-4"
                                  >
                                    <div className="bg-background z-10 flex h-4 w-4 items-center justify-center">
                                      <span className="relative flex h-3 w-3">
                                        <span className="bg-primary/75 absolute inline-flex h-full w-full animate-ping rounded-full" />
                                        <span className="bg-primary relative inline-flex h-3 w-3 rounded-full" />
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold">
                                        {journal.user}
                                      </p>
                                      <time className="text-muted-foreground text-xs">
                                        {formatDistanceToNow(
                                          journal.created_on,
                                          {
                                            addSuffix: true,
                                            locale: ptBR,
                                          },
                                        )}{' '}
                                        (
                                        {format(
                                          journal.created_on,
                                          'dd/MM/yyyy HH:mm',
                                        )}
                                        )
                                      </time>
                                      <p className="bg-muted mt-2 rounded-md border p-3 text-sm">
                                        {journal.notes}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground py-8 text-center text-sm">
                                Nenhum histórico encontrado.
                              </p>
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Total de {tasks.length} tarefa(s)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
