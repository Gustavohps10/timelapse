'use client'

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ClipboardList, Ellipsis, PlusIcon } from 'lucide-react'
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'
import invariant from 'tiny-invariant'

import { Loader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SyncTaskRxDBDTO } from '@/db/schemas/tasks-sync-schema'

import { Card, CardShadow } from './card'
import {
  getColumnData,
  isCardData,
  isCardDropTargetData,
  isColumnData,
  isDraggingACard,
  isDraggingAColumn,
  TCardData,
  TColumn,
} from './data'
import { blockBoardPanningAttr } from './data-attributes'
import { isShallowEqual } from './is-shallow-equal'
import { SettingsContext } from './settings-context'

const fakeTasks: Omit<
  SyncTaskRxDBDTO,
  '_deleted' | 'timeEntryIds' | 'conflicted' | 'timeEntries'
>[] = [
  {
    _id: 'task_1',
    id: 'RDM-456',
    title: 'Implementar tela de dashboard',
    projectName: 'App Interno',
    status: { id: '1', name: 'Novo' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'task_2',
    id: 'JIRA-123',
    title: 'Corrigir bug no login (SSO)',
    projectName: 'Plataforma Core',
    status: { id: '2', name: 'Em Andamento' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'task_3',
    id: 'RDM-457',
    title: 'Otimizar query de usuários na API',
    projectName: 'App Interno',
    status: { id: '1', name: 'Novo' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'task_4',
    id: 'YT-789',
    title: 'Reunião de alinhamento - Sprint Q4',
    projectName: 'Design System',
    status: { id: '5', name: 'Fechado' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

type TColumnState =
  | {
      type: 'is-card-over'
      isOverChildCard: boolean
      dragging: DOMRect
    }
  | {
      type: 'is-column-over'
    }
  | {
      type: 'idle'
    }
  | {
      type: 'is-dragging'
    }

const stateStyles: { [Key in TColumnState['type']]: string } = {
  idle: 'cursor-grab',
  'is-card-over': 'outline outline-2 outline-primary',
  'is-dragging': '',
  'is-column-over': 'bg-slate-900',
}

const idle = { type: 'idle' } satisfies TColumnState

const CardList = memo(function CardList({ column }: { column: TColumn }) {
  return column.cards.map((card, index) => (
    <Card key={index} card={card} columnId={column.id} />
  ))
})

export function Column({ column }: { column: TColumn }) {
  const scrollableRef = useRef<HTMLDivElement | null>(null)
  const outerFullHeightRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const { settings } = useContext(SettingsContext)
  const [state, setState] = useState<TColumnState>(idle)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [tempTitle, setTempTitle] = useState(column.title)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const startEditing = () => {
    setTempTitle(column.title)
    setIsEditing(true)
  }

  const saveEditing = () => {
    setIsEditing(false)
    if (tempTitle !== column.title && column.onChange) {
      column.onChange({
        ...column,
        title: tempTitle,
      })
    }
  }

  const cancelEditing = () => {
    setTempTitle(column.title)
    setIsEditing(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveEditing()
    if (e.key === 'Escape') cancelEditing()
  }

  useEffect(() => {
    const outer = outerFullHeightRef.current
    const scrollable = scrollableRef.current
    const header = headerRef.current
    const inner = innerRef.current
    invariant(outer)
    invariant(scrollable)
    invariant(header)
    invariant(inner)

    const data = getColumnData({ column })

    function setIsCardOver({
      data,
      location,
    }: {
      data: TCardData
      location: DragLocationHistory
    }) {
      const innerMost = location.current.dropTargets[0]
      const isOverChildCard = Boolean(
        innerMost && isCardDropTargetData(innerMost.data),
      )

      const proposed: TColumnState = {
        type: 'is-card-over',
        dragging: data.rect,
        isOverChildCard,
      }

      setState((current) => {
        if (isShallowEqual(proposed, current)) {
          return current
        }
        return proposed
      })
    }

    return combine(
      draggable({
        element: header,
        getInitialData: () => data,
        onGenerateDragPreview({ source, location, nativeSetDragImage }) {
          const data = source.data
          invariant(isColumnData(data))
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: header,
              input: location.current.input,
            }),
            render({ container }) {
              const rect = inner.getBoundingClientRect()
              const preview = inner.cloneNode(true)
              invariant(preview instanceof HTMLElement)
              preview.style.width = `${rect.width}px`
              preview.style.height = `${rect.height}px`

              container.appendChild(preview)
            },
          })
        },
        onDragStart() {
          setState({ type: 'is-dragging' })
        },
        onDrop() {
          setState(idle)
        },
      }),
      dropTargetForElements({
        element: outer,
        getData: () => data,
        canDrop({ source }) {
          return isDraggingACard({ source }) || isDraggingAColumn({ source })
        },
        getIsSticky: () => true,
        onDragStart({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location })
          }
        },
        onDragEnter({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location })
            return
          }
          if (
            isColumnData(source.data) &&
            source.data.column.id !== column.id
          ) {
            setState({ type: 'is-column-over' })
          }
        },
        onDropTargetChange({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location })
            return
          }
        },
        onDragLeave({ source }) {
          if (
            isColumnData(source.data) &&
            source.data.column.id === column.id
          ) {
            return
          }
          setState(idle)
        },
        onDrop() {
          setState(idle)
        },
      }),
      autoScrollForElements({
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false
          }

          return isDraggingACard({ source })
        },
        getConfiguration: () => ({
          maxScrollSpeed: settings.columnScrollSpeed,
        }),
        element: scrollable,
      }),
      unsafeOverflowAutoScrollForElements({
        element: scrollable,
        getConfiguration: () => ({
          maxScrollSpeed: settings.columnScrollSpeed,
        }),
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false
          }

          if (!settings.isOverflowScrollingEnabled) {
            return false
          }

          return isDraggingACard({ source })
        },
        getOverflow() {
          return {
            forTopEdge: {
              top: 1000,
            },
            forBottomEdge: {
              bottom: 1000,
            },
          }
        },
      }),
    )
  }, [column, settings])

  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const allTasks = useMemo(() => {
    const largeList: SyncTaskRxDBDTO[] = []
    for (let i = 0; i < 5000; i++) {
      fakeTasks.forEach((task) => {
        largeList.push({
          ...task,
          _id: `${task._id}_${i}`,
          id: `${task.id}_${i}`,
          title: `${task.title} #${i + 1}`,
          _deleted: false,
          timeEntryIds: [],
        })
      })
    }
    return largeList
  }, [])

  const filteredTasks = useMemo(() => {
    if (!searchValue) {
      return allTasks
    }
    const searchLower = searchValue.toLowerCase()
    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchLower) ||
        task.id.toLowerCase().includes(searchLower),
    )
  }, [searchValue, allTasks])

  const listRef = useRef<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: filteredTasks.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 40,
    overscan: 5,
  })

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        rowVirtualizer.measure()
      }, 100)
    }
  }, [isOpen, rowVirtualizer])

  return (
    <div
      className="flex w-72 flex-shrink-0 flex-col select-none"
      ref={outerFullHeightRef}
    >
      <div
        className={`group bg-card flex max-h-full flex-col rounded-lg text-zinc-50 shadow-sm ${stateStyles[state.type]}`}
        ref={innerRef}
        {...{ [blockBoardPanningAttr]: true }}
      >
        <div
          className={`flex max-h-full flex-col ${
            state.type === 'is-column-over' ? 'invisible' : ''
          }`}
        >
          <div
            className="flex flex-row items-center justify-between px-3 py-2"
            ref={headerRef}
          >
            {!isEditing && (
              <div className="pl-2">
                <div
                  className="text-foreground hover:bg-background hover:border-primary/40 box-border cursor-text rounded-sm border-2 border-transparent px-2 pl-2 text-sm leading-tight font-semibold transition-colors transition-shadow select-none"
                  role="button"
                  aria-label="Column title (double click to edit)"
                  onDoubleClick={startEditing}
                >
                  {column.title} 
                </div>
              </div>
            )}
            {isEditing && (
              <div className="pl-2">
                <input
                  ref={inputRef}
                  className="text-foreground bg-background border-primary/40 ring-primary/40 box-border rounded-sm border-2 px-1 pl-2 text-sm leading-tight font-semibold ring-1 transition-all outline-none"
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={saveEditing}
                  onKeyDown={onKeyDown}
                  aria-label="Edit column title"
                />
              </div>
            )}
            {column.isLoading && <Loader />} 
            {!column.isLoading &&
              Array.isArray(column.actions) &&
              column.actions.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-foreground h-7 w-7 p-1"
                    >
                      <Ellipsis size={16} /> 
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="end"
                    className="bg-popover w-48 rounded-md border p-1 shadow-md"
                  >
                    <div className="flex flex-col gap-1.5">
                      {column.actions.map((group, indexGroup) => (
                        <div key={indexGroup} className="flex flex-col gap-1">
                          {group.title && (
                            <div className="text-sidebar-foreground/70 flex h-5 items-center px-1.5 text-[10px] font-medium">
                              {group.title} 
                            </div>
                          )}

                          <div className="flex flex-col gap-[2px]">
                            {group.items.map((item, indexItem) => (
                              <button
                                key={indexItem}
                                className="hover:bg-accent hover:text-accent-foreground flex h-7 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors"
                                onClick={() => item.onClick(column)}
                              >
                                <span className="flex items-center leading-none [&>svg]:size-4">
                                  {item.icon} 
                                </span>

                                <span className="text-muted-foreground leading-none tracking-tighter">
                                  {item.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
          </div>
          <div
            className="flex flex-col gap-y-3.5 overflow-y-auto px-3 py-3 [overflow-anchor:none] [scrollbar-color:theme(colors.slate.600)_theme(colors.slate.700)] [scrollbar-width:thin]"
            ref={scrollableRef}
          >
            <CardList column={column} /> 
            {state.type === 'is-card-over' && !state.isOverChildCard ? (
              <div className="flex-shrink-0 py-1">
                <CardShadow dragging={state.dragging} /> 
              </div>
            ) : null}
            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open)
                if (open) {
                  setSearchValue('')
                }
              }}
            >
              <DialogTrigger asChild>
                <div className="h-9 pt-1 pb-2 opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100">
                  <button className="text-muted-foreground hover:bg-primary/10 dark:hover:bg-primary/10 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium">
                    <PlusIcon size={16} />  Adicionar
                  </button>
                </div>
              </DialogTrigger>

              <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-2xl [&>button]:hidden">
                <VisuallyHidden>
                  <DialogTitle>Adicionar Card</DialogTitle> 
                  <DialogDescription>
                    Busque uma tarefa ou crie uma nova.
                  </DialogDescription>
                </VisuallyHidden>

                <Command className="[--cmdk-group-heading-font-size:0.75rem]">
                  <CommandInput
                    className="h-10 text-base"
                    placeholder="Buscar tarefa por ID, título ou criar..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />

                  <CommandList
                    ref={listRef}
                    className="max-h-[350px] overflow-x-hidden overflow-y-auto"
                  >
                    <CommandEmpty>Nenhuma tarefa encontrada.</CommandEmpty> 
                    {!searchValue && (
                      <CommandGroup heading="Novo">
                        <CommandItem
                          onSelect={() => {
                            console.log('Selecionou: Criar novo card')
                            setIsOpen(false)
                          }}
                          className="cursor-pointer"
                        >
                          <PlusIcon className="mr-2 h-4 w-4" /> 
                          <span className="text-sm">
                            Criar um novo card local
                          </span>
                        </CommandItem>
                      </CommandGroup>
                    )}
                    {filteredTasks.length > 0 && (
                      <CommandGroup
                        heading="Tarefas Replicadas"
                        className="relative"
                        style={{
                          height: `${rowVirtualizer.getTotalSize()}px`,
                        }}
                      >
                        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                          const task = filteredTasks[virtualItem.index]

                          if (!task) {
                            return null
                          }

                          return (
                            <CommandItem
                              key={task._id}
                              onSelect={() => {
                                console.log('Selecionou tarefa:', task.id)
                                setIsOpen(false)
                              }}
                              className="group/item absolute top-0 left-0 flex w-full cursor-pointer items-center justify-between"
                              style={{
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                              }}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <ClipboardList className="text-muted-foreground h-4 w-4 flex-shrink-0" />

                                <span
                                  className="truncate text-sm"
                                  title={task.title}
                                >
                                  <span className="text-muted-foreground font-medium">
                                    {task.id} 
                                  </span>

                                  <span className="text-foreground/90">
                                    {task.title} 
                                  </span>
                                </span>
                              </div>

                              <span className="text-muted-foreground group-hover/item:text-foreground ml-4 text-xs text-nowrap">
                                {task.projectName} 
                              </span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
