'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Activity,
  ArchiveX,
  BarChart2,
  Briefcase,
  CalendarCheck,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  CircleX,
  ClipboardCheck,
  Code,
  ExternalLink,
  FileText,
  Filter,
  Flag,
  FlaskConical,
  GraduationCap,
  Handshake,
  HelpCircle,
  History,
  KanbanSquare,
  LayoutDashboard,
  LifeBuoy,
  List,
  MoreHorizontal,
  Palette,
  PauseCircle,
  PlusIcon,
  SearchCode,
  Settings,
  ShieldCheck,
  Timer,
  Users,
  Wrench,
  ZapIcon,
} from 'lucide-react'
import { ElementType, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

import { AutoComplete } from '@/components'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSync } from '@/hooks/use-sync'
import {
  SyncMetadataItem,
  SyncMetadataRxDBDTO,
} from '@/sync/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/sync/tasks-sync-schema'

const iconMap: { [key: string]: ElementType } = {
  Timer,
  ZapIcon,
  CheckCircle2,
  CircleX,
  PauseCircle,
  ArchiveX,
  HelpCircle,
  Flag,
  Palette,
  Code,
  BarChart2,
  CalendarCheck,
  CheckCircle,
  FlaskConical,
  SearchCode,
  Settings,
  Wrench,
  LifeBuoy,
  Handshake,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users,
  Briefcase,
  ShieldCheck,
  Activity,
}

function formatTime(seconds: number): string {
  if (!seconds || seconds === 0) return ''
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

function TaskSection({
  title,
  tasks,
  onTaskClick,
  statusMap,
  priorityMap,
}: {
  title: string
  tasks: SyncTaskRxDBDTO[]
  onTaskClick: (type: 'details' | 'history', task: SyncTaskRxDBDTO) => void
  statusMap: Map<string, SyncMetadataItem>
  priorityMap: Map<string, SyncMetadataItem>
}) {
  const [isOpen, setIsOpen] = useState(true)
  if (tasks.length === 0) return null
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 p-2 text-sm font-semibold">
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`}
          />
          <span>{title}</span>
          <Badge variant="secondary">{tasks.length}</Badge>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="rounded-md border">
        <Table>
          <TableBody>
            {tasks.map((task) => (
              <TaskTableRow
                key={task._id}
                task={task}
                onTaskClick={onTaskClick}
                statusMap={statusMap}
                priorityMap={priorityMap}
              />
            ))}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  )
}

function TaskTableRow({
  task,
  onTaskClick,
  statusMap,
  priorityMap,
}: {
  task: SyncTaskRxDBDTO
  onTaskClick: (type: 'details' | 'history', task: SyncTaskRxDBDTO) => void
  statusMap: Map<string, SyncMetadataItem>
  priorityMap: Map<string, SyncMetadataItem>
}) {
  const statusInfo = statusMap.get(task.status.id)
  const priorityInfo = priorityMap.get(task.priority?.id || '')
  const StatusIcon = statusInfo ? iconMap[statusInfo.icon] : Timer
  const PriorityIcon = priorityInfo ? iconMap[priorityInfo.icon] : Flag
  return (
    <TableRow
      onClick={() => onTaskClick('details', task)}
      className="cursor-pointer"
    >
      <TableCell className="w-[100px] py-2">
        {task.url ? (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs font-medium text-zinc-600 brightness-95 filter hover:underline dark:text-zinc-400 dark:brightness-105"
          >
            #{task.id} <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="font-mono text-xs font-medium">#{task.id}</span>
        )}
      </TableCell>
      <TableCell
        className="max-w-xs truncate py-2 font-medium"
        title={task.title}
      >
        {task.title}
      </TableCell>
      <TableCell className="w-[150px] py-2">
        {statusInfo ? (
          <Badge className={statusInfo.colors.badge}>
            <StatusIcon className={`mr-2 h-3 w-3 ${statusInfo.colors.text}`} />
            {task.status.name}
          </Badge>
        ) : (
          <Badge variant="outline">{task.status.name}</Badge>
        )}
      </TableCell>
      <TableCell className="w-[120px] py-2">
        <div className="flex items-center gap-2">
          {priorityInfo && (
            <PriorityIcon className={`h-4 w-4 ${priorityInfo.colors.text}`} />
          )}
          <span>{task.priority?.name ?? 'Não definida'}</span>
        </div>
      </TableCell>
      <TableCell className="w-[180px] py-2 font-mono text-sm">
        {formatTime((task.spentHours ?? 0) * 3600)}
      </TableCell>
      <TableCell
        className="w-[64px] py-2 text-right"
        onClick={(e) => e.stopPropagation()}
      >
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
            <DropdownMenuItem onSelect={() => onTaskClick('details', task)}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Ver Detalhes</span>
            </DropdownMenuItem>
            {task.url && (
              <DropdownMenuItem asChild>
                <a
                  href={task.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex cursor-pointer items-center"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Ver no Redmine
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onTaskClick('history', task)}>
              <History className="mr-2 h-4 w-4" /> Ver Histórico
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function Activities() {
  const { db } = useSync()
  const [tasks, setTasks] = useState<SyncTaskRxDBDTO[]>([])
  const [metadata, setMetadata] = useState<SyncMetadataRxDBDTO | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskId, setNewTaskId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'details' | 'history' | null
    task: SyncTaskRxDBDTO | null
  }>({ isOpen: false, type: null, task: null })

  const openModal = (type: 'details' | 'history', task: SyncTaskRxDBDTO) =>
    setModalState({ isOpen: true, type, task })
  const closeModal = () =>
    setModalState({ isOpen: false, type: null, task: null })

  useEffect(() => {
    if (!db) return
    const tasksSub = db.tasks
      .find({ sort: [{ updatedAt: 'desc' }] })
      .$.subscribe((tasksFromDb) => {
        const tasksData = tasksFromDb.map((doc) =>
          doc.toJSON(),
        ) as SyncTaskRxDBDTO[]
        setTasks(tasksData)
      })
    const metaSub = db.metadata.findOne().$.subscribe((metaDoc) => {
      if (metaDoc) setMetadata(metaDoc.toJSON() as SyncMetadataRxDBDTO)
    })
    return () => {
      tasksSub.unsubscribe()
      metaSub.unsubscribe()
    }
  }, [db])

  const { statusMap, priorityMap } = useMemo(() => {
    if (!metadata) return { statusMap: new Map(), priorityMap: new Map() }
    return {
      statusMap: new Map(metadata.taskStatuses.map((item) => [item.id, item])),
      priorityMap: new Map(
        metadata.taskPriorities.map((item) => [item.id, item]),
      ),
    }
  }, [metadata])

  const filteredTasks = useMemo(
    () =>
      searchTerm.length > 0
        ? tasks.filter(
            (task) =>
              task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              task.id.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : tasks,
    [tasks, searchTerm],
  )

  const groupedTasks = useMemo(() => {
    const pending: SyncTaskRxDBDTO[] = []
    const inProgress: SyncTaskRxDBDTO[] = []
    const completed: SyncTaskRxDBDTO[] = []
    if (statusMap.size === 0) return { pending, inProgress, completed }
    for (const task of filteredTasks) {
      const statusInfo = statusMap.get(task.status.id)
      const icon = statusInfo?.icon
      if (icon === 'CheckCircle2' || icon === 'CircleX' || icon === 'ArchiveX')
        completed.push(task)
      else if (icon === 'ZapIcon') inProgress.push(task)
      else pending.push(task)
    }
    return { pending, inProgress, completed }
  }, [filteredTasks, statusMap])

  const autoCompleteItems = useMemo(
    () =>
      filteredTasks.map((task) => ({
        value: task.id,
        label: `#${task.id} - ${task.title}`,
      })),
    [filteredTasks],
  )

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db?.tasks || !newTaskTitle.trim() || !newTaskId.trim()) return
    const newTask: SyncTaskRxDBDTO = {
      _id: crypto.randomUUID(),
      _deleted: false,
      id: newTaskId.trim(),
      url: '',
      title: newTaskTitle.trim(),
      status: { id: '1', name: 'Nova' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    try {
      await db.tasks.insert(newTask)
      setNewTaskTitle('')
      setNewTaskId('')
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
    }
  }

  if (!metadata) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    )
  }

  return (
    <div className="bg-background flex h-full flex-col p-4 pt-2">
      {/* --- Header e Botão Nova Tarefa (sem alterações) --- */}
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Minhas Tarefas</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddTask}>
              <DialogHeader>
                <DialogTitle>Adicionar Tarefa Manualmente</DialogTitle>
                <DialogDescription>
                  Adicione uma tarefa que não será sincronizada.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taskId" className="text-right">
                    ID
                  </Label>
                  <Input
                    id="taskId"
                    value={newTaskId}
                    onChange={(e) => setNewTaskId(e.target.value)}
                    placeholder="Ex: INTERNA-02"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taskTitle" className="text-right">
                    Título
                  </Label>
                  <Input
                    id="taskTitle"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Título da tarefa"
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- Abas e Filtros (sem alterações) --- */}
      <Tabs defaultValue="list" className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b">
          <TabsList>
            <TabsTrigger value="overview">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" /> Lista
            </TabsTrigger>
            <TabsTrigger value="board">
              <KanbanSquare className="mr-2 h-4 w-4" /> Quadro
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 p-1">
            <div className="w-full max-w-xs flex-1">
              <AutoComplete
                selectedValue={searchTerm}
                onSelectedValueChange={setSearchTerm}
                searchValue={searchTerm}
                onSearchValueChange={setSearchTerm}
                items={autoCompleteItems}
                placeholder="Buscar..."
                emptyMessage="Nenhum resultado."
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Flag className="mr-2 h-4 w-4" /> Prioridade
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-4 w-4" /> Filtros
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </div>
        </div>
        <TabsContent value="overview" className="flex-1 overflow-auto p-4">
          <p className="text-muted-foreground">
            Visualização de Overview em desenvolvimento.
          </p>
        </TabsContent>
        <TabsContent value="list" className="flex-1 overflow-auto">
          <div className="space-y-4 p-4">
            <TaskSection
              title="Pendentes"
              tasks={groupedTasks.pending}
              onTaskClick={openModal}
              statusMap={statusMap}
              priorityMap={priorityMap}
            />
            <TaskSection
              title="Em Andamento"
              tasks={groupedTasks.inProgress}
              onTaskClick={openModal}
              statusMap={statusMap}
              priorityMap={priorityMap}
            />
            <TaskSection
              title="Concluídas"
              tasks={groupedTasks.completed}
              onTaskClick={openModal}
              statusMap={statusMap}
              priorityMap={priorityMap}
            />
          </div>
        </TabsContent>
        <TabsContent value="board" className="flex-1 overflow-auto p-4">
          <p className="text-muted-foreground">
            Visualização de Quadro (Board) em desenvolvimento.
          </p>
        </TabsContent>
      </Tabs>

      <div className="text-muted-foreground flex w-full items-center justify-between border-t pt-2 text-xs">
        <span>Total de {filteredTasks.length} tarefa(s)</span>
      </div>

      {/* --- MODAL DE DETALHES E HISTÓRICO --- */}
      <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
        {modalState.task && (
          <DialogContent className="sm:max-w-6xl">
            <DialogHeader>
              <DialogTitle>
                #{modalState.task.id} - {modalState.task.title}
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue={modalState.type ?? 'details'}>
              <TabsList>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              {/* Aba de Detalhes (sem alterações) */}
              <TabsContent value="details">
                <ScrollArea className="h-[65vh] rounded-md border">
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus as any}
                              language={match[1]}
                              PreTag="div"
                              codeTagProps={{
                                style: {
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-all',
                                },
                              }}
                              customStyle={{
                                background: 'hsl(var(--muted) / 0.5)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {modalState.task.description ||
                        'Nenhuma descrição fornecida.'}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* ✅✅✅ ABA DE HISTÓRICO ATUALIZADA ✅✅✅ */}
              <TabsContent value="history">
                <ScrollArea className="h-[65vh]">
                  <div className="p-4">
                    {(modalState.task.statusChanges?.length ?? 0) > 0 ? (
                      <div className="relative space-y-6">
                        <div className="bg-border absolute top-2 left-[7px] h-full w-px" />
                        {modalState.task.statusChanges
                          ?.slice()
                          .sort(
                            (a, b) =>
                              new Date(b.changedAt).getTime() -
                              new Date(a.changedAt).getTime(),
                          )
                          .map((change, index) => (
                            <div key={index} className="relative flex gap-4">
                              <div className="bg-background z-10 flex h-4 w-4 items-center justify-center">
                                <div className="bg-primary h-2 w-2 rounded-full" />
                              </div>
                              <div className="flex-1">
                                {/* ✅ Exibe o nome do usuário a partir do objeto */}
                                <p className="text-sm font-semibold">
                                  {change.changedBy.name}
                                </p>
                                <time className="text-muted-foreground text-xs">
                                  {formatDistanceToNow(
                                    new Date(change.changedAt),
                                    { addSuffix: true, locale: ptBR },
                                  )}{' '}
                                  (
                                  {format(
                                    new Date(change.changedAt),
                                    'dd/MM/yyyy HH:mm',
                                  )}
                                  )
                                </time>

                                {/* Card principal da alteração */}
                                <div className="bg-muted mt-2 rounded-md border p-3 text-sm">
                                  <p>
                                    Status alterado de{' '}
                                    {/* ✅ Busca o nome do status 'DE' pelo ID */}
                                    <b>
                                      {statusMap.get(change.fromStatus)?.name ??
                                        `ID: ${change.fromStatus}`}
                                    </b>{' '}
                                    para{' '}
                                    {/* ✅ Busca o nome do status 'PARA' pelo ID */}
                                    <b>
                                      {statusMap.get(change.toStatus)?.name ??
                                        `ID: ${change.toStatus}`}
                                    </b>
                                  </p>

                                  {/* ✅ Renderiza a descrição se ela existir */}
                                  {change.description && (
                                    <>
                                      <div className="my-2 border-t" />
                                      <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                        >
                                          {change.description}
                                        </ReactMarkdown>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-8 text-center text-sm">
                        Nenhum histórico de mudança de status encontrado.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
