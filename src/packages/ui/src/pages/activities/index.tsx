'use client'

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
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  CircleX,
  ClipboardCheck,
  Code,
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
import React, { ElementType, useCallback, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { AutoComplete } from '@/components'
import { Button } from '@/components/ui/button'
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
import { useAuth } from '@/hooks'
import { BoardColumn } from '@/pages/activities/components/board-column'
import { TaskCard } from '@/pages/activities/components/task-card'
import { useSyncStore } from '@/stores/syncStore'
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
  GripVertical,
}

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

/**
 * ⚠️ O TaskCard local foi REMOVIDO e a lógica foi migrada para o SortableTaskCard
 * para usar o TaskCard importado e manter a funcionalidade DND.
 */
const SortableTaskCard = React.memo(function SortableTaskCard({
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

  const style: React.CSSProperties = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  // Corrigido: Não retorna <div> vazio/placeholder se não estiver arrastando.
  // A classe 'group' no pai permite o hover no grip.
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative" // Adiciona group aqui
    >
      <div
        {...attributes}
        {...listeners}
        // Ajustado para um z-index maior para garantir que o grip fique por cima
        className="text-muted-foreground/50 absolute top-0 right-0 z-20 cursor-grab p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 active:cursor-grabbing"
        aria-label="Mover tarefa"
      >
        <GripVertical className="h-5 w-5 shrink-0" />
      </div>

      {isDragging ? (
        <div className="border-primary bg-primary/10 h-[140px] w-full rounded-lg border-2 border-dashed" />
      ) : (
        <TaskCard
          task={task}
          priorityMap={priorityMap}
          onTaskClick={onTaskClick}
        />
      )}
    </div>
  )
})

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

  // ESTADO PARA GERENCIAR A ORDEM LOCALMENTE ANTES DO REFRESH DO TANSTACK
  const [localTasks, setLocalTasks] = useState<SyncTaskRxDBDTO[] | undefined>(
    undefined,
  )

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

  const { data: fetchedTasks = [], isLoading: areTasksLoading } = useQuery({
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
    onSuccess: (data: SyncTaskRxDBDTO[]) => {
      // Sincroniza o estado local com os dados do servidor/db
      if (!localTasks) {
        setLocalTasks(data)
      }
    },
  })

  // Usa o estado local se disponível, caso contrário, usa os dados buscados
  const tasks = localTasks ?? fetchedTasks

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
      // No mundo real, você adicionaria o change.description e from/toStatus
      // aqui, mas para o escopo do código, manteremos a atualização mínima.
      const taskDoc = await db.tasks.findOne(taskId).exec()
      if (!taskDoc) throw new Error('Tarefa não encontrada.')

      // Simulação do update (RxDB)
      return taskDoc.update({
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

      const activeTask = active.data.current?.task as
        | SyncTaskRxDBDTO
        | undefined
      if (!activeTask) return

      const activeId = active.id.toString()
      const overId = over.id.toString()

      // 1. Identificar o ID da coluna de destino
      const activeContainerId = active.data.current?.sortable?.containerId
      const overContainerId =
        over.data.current?.sortable?.containerId ?? over.id.toString()

      const isSameContainer = activeContainerId === overContainerId
      const newStatusId = overContainerId

      // 2. Mudança de Status (arrastar para outra coluna)
      if (newStatusId && newStatusId !== activeTask.status.id) {
        const newStatus = statusMap.get(newStatusId)
        if (newStatus) {
          // Otimisticamente atualiza o estado local para uma resposta imediata
          setLocalTasks((prevTasks) => {
            if (!prevTasks) return []
            const taskToMove = prevTasks.find((t) => t._id === activeId)
            if (!taskToMove) return prevTasks

            const updatedTasks = prevTasks.map((t) =>
              t._id === activeId
                ? { ...t, status: { id: newStatus.id, name: newStatus.name } }
                : t,
            )
            return updatedTasks.sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            ) // Sort provisório, a ordem real deve ser tratada no backend/db
          })

          updateTaskStatusMutation.mutate({
            taskId: activeId,
            newStatus: { id: newStatus.id, name: newStatus.name },
          })
        }
      }

      // 3. Reordenação dentro da mesma coluna
      else if (isSameContainer && activeId !== overId) {
        // Encontrar a lista de tarefas da coluna afetada
        const currentTasksInColumn = filteredTasks.filter(
          (t) => t.status.id === activeContainerId,
        )

        const oldIndex = currentTasksInColumn.findIndex(
          (t) => t._id === activeId,
        )
        const newIndex = currentTasksInColumn.findIndex((t) => t._id === overId)

        if (oldIndex !== -1 && newIndex !== -1) {
          // Otimisticamente atualiza o estado local (Dnd-kit helper)
          const newOrderedTasksInColumn = arrayMove(
            currentTasksInColumn,
            oldIndex,
            newIndex,
          )

          // Atualiza o estado global das tarefas (localTasks)
          setLocalTasks((prevTasks) => {
            if (!prevTasks) return []

            const updatedTasks = prevTasks.map((task) => {
              const reorderedTask = newOrderedTasksInColumn.find(
                (t) => t._id === task._id,
              )
              // Se a tarefa foi reordenada, atualiza-a no array
              if (reorderedTask) {
                // Em um cenário real, você atualizaria um campo 'order' aqui
                return task
              }
              return task
            })

            // Substitui as tarefas reordenadas de volta ao array principal
            const tasksWithoutMoved = updatedTasks.filter(
              (t) => t.status.id !== activeContainerId,
            )

            // Aqui é um placeholder: em um sistema real, você precisaria de um array que
            // contenha a nova ordem, o que é mais complexo com RxDB.
            // Para manter a reordenação visual, você precisaria de uma mutation para atualizar
            // a ordem no banco de dados e invalidar a query.
            return [...tasksWithoutMoved, ...newOrderedTasksInColumn]
          })

          // **Ação real no banco de dados:**
          // updateTaskPositionMutation.mutate({
          //   taskId: activeId,
          //   newIndex: newIndex,
          //   containerId: activeContainerId,
          // })
          // O código acima é um placeholder para a chamada de API/DB para persistir a nova ordem.
        }
      }
    },
    [filteredTasks, statusMap, updateTaskStatusMutation], // Adiciona filteredTasks para reordenação
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
                  )}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Container principal para as Tabs (utiliza flex-1) */}
      <Tabs
        defaultValue="board"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
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
        {/* TabsContent com flex-1 e min-h-0 para permitir que o conteúdo se expanda e use o espaço restante */}
        <TabsContent value="board" className="flex min-h-0 flex-1 flex-col">
          {areTasksLoading && !localTasks ? (
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
              {/* ScrollArea principal para o scroll horizontal (flex-1 para ocupar o espaço vertical) */}
              <ScrollArea className="min-h-0 w-full flex-1 whitespace-nowrap">
                <div className="inline-block h-full w-max space-x-4 p-4">
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
                {/* ScrollBar horizontal */}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              <DragOverlay>
                {activeTask ? (
                  <div className="w-[320px]">
                    <TaskCard
                      task={activeTask}
                      priorityMap={priorityMap}
                      onTaskClick={() => {}}
                      style={{ boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }}
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
                {/* ScrollArea para o conteúdo do modal (Detalhes/Histórico) */}
                <ScrollArea className="max-h-[65vh]">
                  <TabsContent value="details" className="mt-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '')
                            return match ? (
                              <></>
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
                                    )}
                                    (
                                    {format(
                                      new Date(change.changedAt),
                                      'dd/MM/yyyy HH:mm',
                                    )}
                                    )
                                  </time>
                                  <div className="bg-muted mt-2 rounded-md border p-3 text-sm">
                                    <p>
                                      Status alterado de
                                      <b>
                                        {statusMap.get(change.fromStatus)
                                          ?.name ?? `ID: ${change.fromStatus}`}
                                      </b>
                                      para
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
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </Tabs>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
