'use client'

// --- TANSTACK/REACT-QUERY IMPORTS ---
// --- DND-KIT IMPORTS ---
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// --- DATE-FNS IMPORTS ---
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
// --- LUCIDE-REACT ICONS ---
import {
  Activity,
  ArchiveX,
  BarChart2,
  Briefcase,
  CalendarCheck,
  CheckCircle,
  CheckCircle2,
  CircleX,
  ClipboardCheck,
  Code,
  ExternalLink,
  FileText,
  Filter,
  Flag,
  FlaskConical,
  GraduationCap,
  GripVertical,
  Handshake,
  HelpCircle,
  KanbanSquare,
  LifeBuoy,
  Loader2,
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
// --- REACT HOOKS ---
import React, { ElementType, useCallback, useMemo, useState } from 'react'
// --- MARKDOWN & SYNTAX HIGHLIGHTING ---
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

// --- CUSTOM COMPONENTS (from your project) ---
import { AutoComplete } from '@/components'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/hooks'
// --- ZUSTAND STORE & RXDB SCHEMAS ---
import { useSyncStore } from '@/stores/syncStore'
import {
  SyncMetadataItem,
  SyncMetadataRxDBDTO,
} from '@/sync/metadata-sync-schema'
import { SyncTaskRxDBDTO } from '@/sync/tasks-sync-schema'

// ============================================================================
// --- TIPAGENS E CONSTANTES ---
// ============================================================================

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

// ============================================================================
// --- HELPER FUNCTIONS ---
// ============================================================================

function formatTime(seconds: number): string {
  if (!seconds || seconds === 0) return '00:00:00'
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

// ============================================================================
// --- COMPONENTES DO BOARD (DND) ---
// ============================================================================

const TaskCard = React.memo(function TaskCard({
  task,
  priorityMap,
  onTaskClick,
}: {
  task: SyncTaskRxDBDTO
  priorityMap: Map<string, SyncMetadataItem>
  onTaskClick: (task: SyncTaskRxDBDTO) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { type: 'Task', task } })

  const style = { transition, transform: CSS.Transform.toString(transform) }
  const priorityInfo = priorityMap.get(task.priority?.id || '')
  const PriorityIcon = priorityInfo ? iconMap[priorityInfo.icon] : Flag

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-primary bg-primary/10 h-[140px] w-full rounded-lg border-2 border-dashed"
      />
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative w-full shrink-0 cursor-grab active:cursor-grabbing"
      onClick={() => onTaskClick(task)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
        <div className="w-full space-y-1 overflow-hidden">
          {task.url && (
            <a
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 font-mono text-xs font-medium text-zinc-600 brightness-95 filter hover:underline dark:text-zinc-400 dark:brightness-105"
            >
              #{task.id} <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <p className="line-clamp-2 text-sm font-semibold" title={task.title}>
            {task.title}
          </p>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="text-muted-foreground/50 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Mover tarefa"
        >
          <GripVertical className="h-5 w-5 shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-2">
          {priorityInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <PriorityIcon
                    className={`h-4 w-4 ${priorityInfo.colors.text}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Prioridade: {task.priority?.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {task.assignedTo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {task.assignedTo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Atribuído a: {task.assignedTo.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="font-mono text-sm font-medium">
          {formatTime((task.spentHours ?? 0) * 3600)}
        </div>
      </CardContent>
    </Card>
  )
})

const BoardColumn = React.memo(function BoardColumn({
  status,
  tasks,
  priorityMap,
  onTaskClick,
}: {
  status: SyncMetadataItem
  tasks: SyncTaskRxDBDTO[]
  priorityMap: Map<string, SyncMetadataItem>
  onTaskClick: (task: SyncTaskRxDBDTO) => void
}) {
  const taskIds = useMemo(() => tasks.map((task) => task._id), [tasks])

  return (
    <div className="bg-muted/50 flex h-full w-[320px] shrink-0 flex-col rounded-md">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-semibold">{status.name}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <ScrollArea className="flex-1">
        <SortableContext id={status.id} items={taskIds}>
          <div className="flex flex-col gap-2 p-2">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  priorityMap={priorityMap}
                  onTaskClick={onTaskClick}
                />
              ))
            ) : (
              <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed">
                <p className="text-muted-foreground text-sm">
                  Solte tarefas aqui
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  )
})

// ============================================================================
// --- COMPONENTE PRINCIPAL ---
// ============================================================================

export function Activities() {
  const db = useSyncStore((state) => state.db)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskId, setNewTaskId] = useState('')
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false)
  const [modalState, setModalState] = useState<{
    type: 'details' | 'history'
    task: SyncTaskRxDBDTO | null
  }>({ type: 'details', task: null })
  const [activeTask, setActiveTask] = useState<SyncTaskRxDBDTO | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const { data: metadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: async () => {
      if (!db?.metadata) return null
      const metaDoc = await db.metadata.findOne().exec()
      return metaDoc ? (metaDoc.toJSON() as SyncMetadataRxDBDTO) : null
    },
    enabled: !!db,
    staleTime: 1000 * 60 * 5,
  })

  const { data: tasks = [], isLoading: areTasksLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!db?.tasks || !user?.id) return []
      const tasksFromDb = await db.tasks
        .find({
          selector: {
            $or: [
              { participants: { $elemMatch: { id: user.id.toString() } } },
              { 'assignedTo.id': user.id.toString() },
            ],
          },
          sort: [{ updatedAt: 'desc' }],
        })
        .exec()
      return tasksFromDb.map((doc) => doc.toJSON()) as SyncTaskRxDBDTO[]
    },
    enabled: !!db && !!user?.id,
  })

  const { data: fullTaskDetails, isLoading: isModalLoading } = useQuery({
    queryKey: ['task-details', modalState.task?._id],
    queryFn: async () => {
      if (!db?.tasks || !modalState.task?._id) return null
      const fullDoc = await db.tasks.findOne(modalState.task._id).exec()
      return fullDoc ? (fullDoc.toJSON() as SyncTaskRxDBDTO) : null
    },
    enabled: !!modalState.task,
  })

  const addTaskMutation = useMutation({
    mutationFn: async (newTask: SyncTaskRxDBDTO) => {
      if (!db?.tasks) throw new Error('DB não disponível.')
      return db.tasks.insert(newTask)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
      setNewTaskTitle('')
      setNewTaskId('')
      setIsNewTaskDialogOpen(false)
    },
    onError: (error) => console.error('Erro ao adicionar tarefa:', error),
  })

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({
      taskId,
      newStatus,
    }: {
      taskId: string
      newStatus: { id: string; name: string }
    }) => {
      if (!db?.tasks) throw new Error('DB não está pronto.')
      return db.tasks.findOne(taskId).update({
        $set: { status: newStatus, updatedAt: new Date().toISOString() },
      })
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] }),
    onError: (error) =>
      console.error('Falha ao atualizar o status da tarefa:', error),
  })

  const { statusMap, priorityMap, taskStatuses } = useMemo(() => {
    if (!metadata)
      return { statusMap: new Map(), priorityMap: new Map(), taskStatuses: [] }
    return {
      statusMap: new Map(metadata.taskStatuses.map((item) => [item.id, item])),
      priorityMap: new Map(
        metadata.taskPriorities.map((item) => [item.id, item]),
      ),
      taskStatuses: metadata.taskStatuses || [],
    }
  }, [metadata])

  const filteredTasks = useMemo(
    () =>
      searchTerm
        ? tasks.filter(
            (task) =>
              task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              task.id.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : tasks,
    [tasks, searchTerm],
  )

  const groupedTasksByStatus = useMemo(() => {
    const grouped = new Map<string, SyncTaskRxDBDTO[]>()
    taskStatuses.forEach((status) => grouped.set(status.id, []))
    filteredTasks.forEach((task) => {
      const taskList = grouped.get(task.status.id)
      if (taskList) taskList.push(task)
    })
    return grouped
  }, [filteredTasks, taskStatuses])

  const autoCompleteItems = useMemo(
    () =>
      filteredTasks.map((task) => ({
        value: task.id,
        label: `#${task.id} - ${task.title}`,
      })),
    [filteredTasks],
  )

  const handleOpenModal = useCallback((task: SyncTaskRxDBDTO) => {
    setModalState({ type: 'details', task })
  }, [])
  const handleCloseModal = () => setModalState({ type: 'details', task: null })

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !newTaskId.trim() || !user) return

    const firstStatus = taskStatuses[0]
    const newStatus = firstStatus
      ? { id: firstStatus.id, name: firstStatus.name }
      : { id: '1', name: 'Nova' }

    const newTask: Omit<SyncTaskRxDBDTO, '_rev'> = {
      _id: crypto.randomUUID(),
      _deleted: false,
      id: newTaskId.trim(),
      url: '',
      title: newTaskTitle.trim(),
      status: newStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { id: user.id.toString(), name: user.firstname },
      participants: [
        { id: user.id.toString(), name: user.firstname, role: { id: '1' } },
      ],
    }
    addTaskMutation.mutate(newTask as SyncTaskRxDBDTO)
  }

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task')
      setActiveTask(event.active.data.current.task)
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null)
      const { active, over } = event
      if (!over || !active) return

      const taskToMove = tasks.find((t) => t._id === active.id)
      if (!taskToMove || active.id === over.id) return

      const overContainerId =
        over.data.current?.sortable?.containerId ?? over.id.toString()
      const newStatusId = overContainerId

      if (newStatusId && newStatusId !== taskToMove.status.id) {
        const newStatus = statusMap.get(newStatusId)
        if (newStatus) {
          updateTaskStatusMutation.mutate({
            taskId: taskToMove._id,
            newStatus: { id: newStatus.id, name: newStatus.name },
          })
        }
      }
    },
    [tasks, statusMap, updateTaskStatusMutation],
  )

  if (!metadata) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        <p className="text-muted-foreground ml-2">Carregando metadados...</p>
      </div>
    )
  }

  return (
    <div className="bg-background flex h-screen flex-col overflow-hidden p-4 pt-2">
      <header className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Minhas Tarefas</h1>
        <Dialog
          open={isNewTaskDialogOpen}
          onOpenChange={setIsNewTaskDialogOpen}
        >
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
                <Button type="submit" disabled={addTaskMutation.isPending}>
                  {addTaskMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{' '}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Tabs
        defaultValue="board"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b">
          <TabsList>
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
                  <Filter className="mr-2 h-4 w-4" /> Filtros
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="board" className="flex min-h-0 flex-1 flex-col">
          {areTasksLoading ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              <p className="text-muted-foreground ml-2">
                Carregando tarefas...
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <ScrollArea className="w-full flex-1 whitespace-nowrap">
                <div className="flex h-full w-max space-x-4 p-4">
                  {taskStatuses.map((status) => (
                    <BoardColumn
                      key={status.id}
                      status={status}
                      tasks={groupedTasksByStatus.get(status.id) || []}
                      priorityMap={priorityMap}
                      onTaskClick={handleOpenModal}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <DragOverlay>
                {activeTask ? (
                  <div className="w-[304px]">
                    <TaskCard
                      task={activeTask}
                      priorityMap={priorityMap}
                      onTaskClick={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </TabsContent>
      </Tabs>
      <footer className="text-muted-foreground flex w-full items-center justify-between border-t pt-2 text-xs">
        <span>Total de {filteredTasks.length} tarefa(s)</span>
      </footer>

      {/* MODAL DE DETALHES/HISTÓRICO */}
      <Dialog open={!!modalState.task} onOpenChange={handleCloseModal}>
        <DialogContent className="max-h-[90vh] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {modalState.task
                ? `#${modalState.task.id} - ${modalState.task.title}`
                : 'Carregando...'}
            </DialogTitle>
          </DialogHeader>
          {isModalLoading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : (
            fullTaskDetails && (
              <Tabs defaultValue={modalState.type} className="flex flex-col">
                <TabsList>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
                <ScrollArea className="max-h-[65vh]">
                  <TabsContent value="details" className="mt-4">
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
                        {fullTaskDetails.description ||
                          'Nenhuma descrição fornecida.'}
                      </ReactMarkdown>
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="mt-4">
                    <div className="p-4">
                      {(fullTaskDetails.statusChanges?.length ?? 0) > 0 ? (
                        <div className="relative space-y-6">
                          <div className="bg-border absolute top-2 left-[7px] h-full w-px" />
                          {fullTaskDetails.statusChanges
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
                                  <div className="bg-muted mt-2 rounded-md border p-3 text-sm">
                                    <p>
                                      Status alterado de{' '}
                                      <b>
                                        {statusMap.get(change.fromStatus)
                                          ?.name ?? `ID: ${change.fromStatus}`}
                                      </b>{' '}
                                      para{' '}
                                      <b>
                                        {statusMap.get(change.toStatus)?.name ??
                                          `ID: ${change.toStatus}`}
                                      </b>
                                    </p>
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
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
