'use client'

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
  GripVertical,
  Handshake,
  HelpCircle,
  History,
  KanbanSquare,
  LifeBuoy,
  List,
  Loader2,
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
// --- REACT HOOKS ---
import React, {
  ElementType,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
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

// --- ICON MAPPING ---
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

// --- HELPER FUNCTIONS ---
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
// --- BOARD VIEW COMPONENTS (DND IMPLEMENTATION) ---
// ============================================================================

const TaskCard = React.memo(function TaskCard({
  task,
  priorityMap,
  onTaskClick,
}: {
  task: SyncTaskRxDBDTO
  priorityMap: Map<string, SyncMetadataItem>
  onTaskClick: (type: 'details' | 'history', task: SyncTaskRxDBDTO) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { type: 'Task', task } })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  const priorityInfo = priorityMap.get(task.priority?.id || '')
  const PriorityIcon = priorityInfo ? iconMap[priorityInfo.icon] : Flag

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-primary bg-primary/10 h-[140px] w-[300px] shrink-0 rounded-lg border-2 border-dashed"
      />
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative h-[140px] w-[300px] shrink-0 cursor-grab active:cursor-grabbing"
      onClick={() => onTaskClick('details', task)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
        <div className="space-y-1">
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
          className="text-muted-foreground/50 hover:bg-accent rounded p-1 group-hover:opacity-100 sm:opacity-0"
          aria-label="Mover tarefa"
        >
          <GripVertical className="h-5 w-5" />
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

function BoardView({
  tasks,
  groupedTasks,
  priorityMap,
  onTaskClick,
  statusMap,
}: {
  tasks: SyncTaskRxDBDTO[]
  groupedTasks: {
    pending: SyncTaskRxDBDTO[]
    inProgress: SyncTaskRxDBDTO[]
    completed: SyncTaskRxDBDTO[]
  }
  priorityMap: Map<string, SyncMetadataItem>
  onTaskClick: (type: 'details' | 'history', task: SyncTaskRxDBDTO) => void
  statusMap: Map<string, SyncMetadataItem>
}) {
  const db = useSyncStore((state) => state.db)
  const [activeTask, setActiveTask] = useState<SyncTaskRxDBDTO | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const inProgressTaskIds = useMemo(
    () => groupedTasks.inProgress.map((t) => t._id),
    [groupedTasks.inProgress],
  )
  const pendingTaskIds = useMemo(
    () => groupedTasks.pending.map((t) => t._id),
    [groupedTasks.pending],
  )
  const completedTaskIds = useMemo(
    () => groupedTasks.completed.map((t) => t._id),
    [groupedTasks.completed],
  )

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
    }
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null)
      const { active, over } = event

      if (!over || !active || active.id === over.id) return

      const activeTask = tasks.find((t) => t._id === active.id)
      if (!activeTask) return

      const overContainerId =
        over.data.current?.sortable?.containerId ?? over.id

      let newStatusId: string | null = null

      const findStatusByIcon = (icon: string) =>
        Array.from(statusMap.values()).find((s) => s.icon === icon)
      const findFirstPendingStatus = () => {
        const completedIds = new Set(
          Array.from(statusMap.values())
            .filter((s) =>
              ['CheckCircle2', 'CircleX', 'ArchiveX'].includes(s.icon),
            )
            .map((s) => s.id),
        )
        const inProgressId = findStatusByIcon('ZapIcon')?.id
        return Array.from(statusMap.values()).find(
          (s) => s.id !== inProgressId && !completedIds.has(s.id),
        )
      }

      if (overContainerId === 'inProgressLane') {
        newStatusId = findStatusByIcon('ZapIcon')?.id || null
      } else if (overContainerId === 'Pendentes') {
        newStatusId = findFirstPendingStatus()?.id || null
      } else if (overContainerId === 'Concluídas') {
        newStatusId = findStatusByIcon('CheckCircle2')?.id || null
      }

      if (newStatusId && newStatusId !== activeTask.status.id) {
        const newStatus = statusMap.get(newStatusId)
        if (db?.tasks && newStatus) {
          await db.tasks.findOne(activeTask._id).update({
            $set: {
              status: { id: newStatus.id, name: newStatus.name },
              updatedAt: new Date().toISOString(),
            },
          })
        }
      }
    },
    [tasks, db, statusMap],
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4">
        <h2 className="mb-2 text-lg font-semibold">Em Andamento</h2>
        <ScrollArea className="w-full rounded-md border p-4 whitespace-nowrap">
          {/* ✅ CADA SEÇÃO AGORA É UM SORTABLE CONTEXT INDEPENDENTE */}
          <SortableContext id="inProgressLane" items={inProgressTaskIds}>
            <div className="flex w-max space-x-4">
              {groupedTasks.inProgress.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  priorityMap={priorityMap}
                  onTaskClick={onTaskClick}
                />
              ))}
            </div>
          </SortableContext>
        </ScrollArea>
      </div>

      <div className="space-y-4 p-4">
        <Collapsible defaultOpen className="space-y-2">
          <CollapsibleTrigger className="flex w-full flex-1 items-center gap-2 p-2 text-sm font-semibold">
            <ChevronDown className="h-4 w-4 transition-transform data-[state=closed]:-rotate-90" />
            <span>Pendentes</span>
            <Badge variant="secondary">{groupedTasks.pending.length}</Badge>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SortableContext id="Pendentes" items={pendingTaskIds}>
              <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupedTasks.pending.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    priorityMap={priorityMap}
                    onTaskClick={onTaskClick}
                  />
                ))}
              </div>
            </SortableContext>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible defaultOpen className="space-y-2">
          <CollapsibleTrigger className="flex w-full flex-1 items-center gap-2 p-2 text-sm font-semibold">
            <ChevronDown className="h-4 w-4 transition-transform data-[state=closed]:-rotate-90" />
            <span>Concluídas</span>
            <Badge variant="secondary">{groupedTasks.completed.length}</Badge>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SortableContext id="Concluídas" items={completedTaskIds}>
              <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupedTasks.completed.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    priorityMap={priorityMap}
                    onTaskClick={onTaskClick}
                  />
                ))}
              </div>
            </SortableContext>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* ✅✅✅ OVERLAY LEVE PARA MÁXIMA PERFORMANCE ✅✅✅ */}
      <DragOverlay>
        {activeTask ? (
          <Card className="border-primary h-[140px] w-[300px] shrink-0 border-2 opacity-75">
            <CardHeader>
              <p
                className="line-clamp-2 text-sm font-semibold"
                title={activeTask.title}
              >
                {activeTask.title}
              </p>
            </CardHeader>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// ============================================================================
// --- LIST VIEW & MAIN COMPONENT (INTACTOS) ---
// ============================================================================
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
            onClick={(e) => e.stopPropagation()}
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
  const db = useSyncStore((state) => state?.db)
  const { user } = useAuth()

  const [tasks, setTasks] = useState<SyncTaskRxDBDTO[]>([])
  const [metadata, setMetadata] = useState<SyncMetadataRxDBDTO | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskId, setNewTaskId] = useState('')
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'details' | 'history' | null
    task: SyncTaskRxDBDTO | null
  }>({ isOpen: false, type: null, task: null })
  const [fullTaskDetails, setFullTaskDetails] = useState<
    SyncTaskRxDBDTO | undefined
  >(undefined)
  const [isModalLoading, setIsModalLoading] = useState(false)

  const openModal = useCallback(
    async (type: 'details' | 'history', task: SyncTaskRxDBDTO) => {
      if (!db?.tasks) return
      setModalState({ isOpen: true, type, task })
      setIsModalLoading(true)
      setFullTaskDetails(undefined)
      try {
        const fullDoc = await db.tasks.findOne(task._id).exec()
        if (fullDoc) {
          setFullTaskDetails(fullDoc.toJSON() as SyncTaskRxDBDTO)
        }
      } catch (error) {
        console.error('Falha ao buscar detalhes da tarefa:', error)
      } finally {
        setIsModalLoading(false)
      }
    },
    [db],
  )

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, type: null, task: null })
    setFullTaskDetails(undefined)
  }, [])

  useEffect(() => {
    if (!db) return
    const metaSub = db.metadata.findOne().$.subscribe((metaDoc) => {
      if (metaDoc) setMetadata(metaDoc.toJSON() as SyncMetadataRxDBDTO)
    })
    return () => metaSub.unsubscribe()
  }, [db])

  useEffect(() => {
    if (!db || !user?.id) {
      setTasks([])
      return
    }
    const tasksSub = db.tasks
      .find({
        selector: {
          $or: [
            { participants: { $elemMatch: { id: user.id.toString() } } },
            { 'assignedTo.id': user.id.toString() },
          ],
        },
        sort: [{ updatedAt: 'desc' }],
      })
      .$.subscribe((tasksFromDb) => {
        const tasksData = tasksFromDb.map((doc) =>
          doc.toJSON(),
        ) as SyncTaskRxDBDTO[]
        setTasks(tasksData)
      })
    return () => tasksSub.unsubscribe()
  }, [db, user?.id])

  const { statusMap, priorityMap, estimationTypeMap } = useMemo(() => {
    if (!metadata)
      return {
        statusMap: new Map(),
        priorityMap: new Map(),
        estimationTypeMap: new Map(),
      }
    return {
      statusMap: new Map(metadata.taskStatuses.map((item) => [item.id, item])),
      priorityMap: new Map(
        metadata.taskPriorities.map((item) => [item.id, item]),
      ),
      estimationTypeMap: new Map(
        metadata.estimationTypes.map((item) => [item.id, item]),
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
    const groups: { [key: string]: SyncTaskRxDBDTO[] } = {
      pending: [],
      inProgress: [],
      completed: [],
    }
    const inProgressStatus = Array.from(statusMap.values()).find(
      (s) => s.icon === 'ZapIcon',
    )
    const completedStatuses = new Set(
      Array.from(statusMap.values())
        .filter((s) => ['CheckCircle2', 'CircleX', 'ArchiveX'].includes(s.icon))
        .map((s) => s.id),
    )

    for (const task of filteredTasks) {
      if (task.status.id === inProgressStatus?.id) {
        groups.inProgress.push(task)
      } else if (completedStatuses.has(task.status.id)) {
        groups.completed.push(task)
      } else {
        groups.pending.push(task)
      }
    }
    return groups as {
      pending: SyncTaskRxDBDTO[]
      inProgress: SyncTaskRxDBDTO[]
      completed: SyncTaskRxDBDTO[]
    }
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
    if (!db?.tasks || !newTaskTitle.trim() || !newTaskId.trim() || !user) return
    const newTask: SyncTaskRxDBDTO = {
      _id: crypto.randomUUID(),
      _deleted: false,
      id: newTaskId.trim(),
      url: '',
      title: newTaskTitle.trim(),
      status: { id: '1', name: 'Nova' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { id: user.id.toString(), name: user.firstname },
      participants: [
        { id: user.id.toString(), name: user.firstname, role: { id: '1' } },
      ],
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
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        <p className="text-muted-foreground ml-2">Carregando metadados...</p>
      </div>
    )
  }

  return (
    <div className="bg-background flex h-screen flex-col p-4 pt-2">
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

      <Tabs
        defaultValue="board"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b">
          <TabsList>
            <TabsTrigger value="board">
              <KanbanSquare className="mr-2 h-4 w-4" /> Quadro
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" /> Lista
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
        <TabsContent value="board" className="flex-1 overflow-auto">
          <BoardView
            tasks={filteredTasks}
            groupedTasks={groupedTasks}
            priorityMap={priorityMap}
            onTaskClick={openModal}
            statusMap={statusMap}
          />
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
      </Tabs>
      <div className="text-muted-foreground flex w-full items-center justify-between border-t pt-2 text-xs">
        <span>Total de {filteredTasks.length} tarefa(s)</span>
      </div>
      <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              {modalState.task
                ? `#${modalState.task.id} - ${modalState.task.title}`
                : 'Carregando...'}
            </DialogTitle>
          </DialogHeader>
          {isModalLoading ? (
            <div className="flex h-[65vh] items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : (
            fullTaskDetails && (
              <Tabs defaultValue={modalState.type ?? 'details'}>
                <TabsList>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
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
                        {fullTaskDetails.description ||
                          'Nenhuma descrição fornecida.'}
                      </ReactMarkdown>
                      {(fullTaskDetails.estimatedTimes?.length ?? 0) > 0 && (
                        <>
                          <hr />
                          <h4 className="not-prose font-semibold">
                            Tempos Estimados
                          </h4>
                          <ul className="not-prose list-none p-0">
                            {fullTaskDetails.estimatedTimes?.map((est) => {
                              const estType = estimationTypeMap.get(est.id)
                              const Icon = estType
                                ? iconMap[estType.icon] || Timer
                                : Timer
                              return (
                                <li
                                  key={est.id}
                                  className="bg-muted/50 mb-2 flex items-center justify-between rounded-md border p-2 text-sm"
                                >
                                  <span className="flex items-center gap-2 font-medium">
                                    <Icon
                                      className={`h-4 w-4 ${estType?.colors.text ?? 'text-muted-foreground'}`}
                                    />
                                    {estType?.name ?? est.name}
                                  </span>
                                  <span className="font-mono text-sm font-medium">
                                    {formatTime(est.hours * 3600)}
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="history">
                  <ScrollArea className="h-[65vh]">
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
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
