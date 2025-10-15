'use client'

import { MaskitoOptions } from '@maskito/core'
import { ElementState } from '@maskito/core/src/lib/types'
import { useQuery } from '@tanstack/react-query'
import { endOfDay, format, startOfDay } from 'date-fns'
import {
  BarChart2,
  Briefcase,
  CalendarCheck,
  CalendarDaysIcon,
  CheckCircle,
  ClipboardCheck,
  ClockArrowDownIcon,
  ClockArrowUpIcon,
  Code,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  Hash,
  LifeBuoy,
  Palette,
  Pause,
  Play,
  SearchCode,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import { useContext, useMemo, useState } from 'react'

import { columns, Row } from '@/components/time-entries-table/columns'
import {
  DataTable,
  TimeEntry,
} from '@/components/time-entries-table/data-table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TimeEntriesContext } from '@/contexts/TimeEntriesContext'
import { useSync } from '@/hooks/use-sync'
import { TimeEntry as TimeEntryReducer } from '@/reducers/time-entries/reducer'

const items = [
  { value: '-', label: '--- Selecione ---', icon: null },
  { value: '8', label: 'Design', icon: Palette },
  { value: '9', label: 'Desenvolvimento', icon: Code },
  { value: '10', label: 'Análise', icon: BarChart2 },
  { value: '11', label: 'Planejamento', icon: CalendarCheck },
  { value: '12', label: 'Encerramento', icon: CheckCircle },
  { value: '13', label: 'Teste', icon: FlaskConical },
  { value: '14', label: 'Revisão Código', icon: SearchCode },
  { value: '15', label: 'Gerência de Configuração', icon: Settings },
  { value: '16', label: 'Correção', icon: Wrench },
  { value: '17', label: 'Suporte', icon: LifeBuoy },
  { value: '18', label: 'Apoio', icon: Handshake },
  { value: '19', label: 'Homologação', icon: ClipboardCheck },
  { value: '25', label: 'Documentação', icon: FileText },
  { value: '26', label: 'Treinamento', icon: GraduationCap },
  { value: '27', label: 'Reunião', icon: Users },
  { value: '28', label: 'Gestão', icon: Briefcase },
]

export const timeMask: MaskitoOptions = {
  mask: [/\d/, /\d/, ':', /[0-5]/, /\d/, ':', /[0-5]/, /\d/],
  overwriteMode: 'replace',

  preprocessors: [
    ({ elementState, data }, actionType) => {
      const { value, selection } = elementState
      let [posStart, posEnd] = selection

      if (posEnd > posStart) {
        let newValue = value
          .split('')
          .map((c, i) =>
            i >= posStart && i < posEnd && /\d/.test(c) ? '0' : c,
          )
          .join('')
        return {
          elementState: { value: newValue, selection: [posStart, posStart] },
          data: '',
        }
      }

      // Backspace
      if (actionType === 'deleteBackward' && posStart > 0) {
        let i = posStart - 1
        if (/\d/.test(value[i])) {
          const newValue = value.substring(0, i) + '0' + value.substring(i + 1)
          return {
            elementState: { value: newValue, selection: [i, i] },
            data: '',
          }
        }
      }

      // Delete
      if (actionType === 'deleteForward' && posStart < value.length) {
        let i = posStart
        if (/\d/.test(value[i])) {
          const newValue = value.substring(0, i) + '0' + value.substring(i + 1)
          return {
            elementState: { value: newValue, selection: [i, i] },
            data: '',
          }
        }
      }

      return { elementState, data }
    },
  ],

  postprocessors: [
    (elementState: ElementState): ElementState => {
      const { value, selection } = elementState
      const [h = '00', m = '00', s = '00'] = value.split(':')
      const hh = String(Math.min(Number(h), 99)).padStart(2, '0')
      const mm = String(Math.min(Number(m), 59)).padStart(2, '0')
      const ss = String(Math.min(Number(s), 59)).padStart(2, '0')
      const finalValue = `${hh}:${mm}:${ss}`
      return { value: finalValue, selection }
    },
  ],
}

function groupByIssue(data: TimeEntry[]): Row[] {
  const groups: Record<string, Row> = {}

  for (const item of data) {
    const key = String(item.issue_id ?? 'sem-issue')

    if (!groups[key]) {
      groups[key] = {
        ...item,
        hours: 0,
        spent_on: 'Invalid Date',
        comments: '',
        sincStatus: 'pending',
        subRows: [],
      }
    }

    groups[key].hours += item.hours
    groups[key].subRows?.push(item)
  }

  return Object.values(groups)
}

export function TimeEntries() {
  const [manualMinutes, setManualMinutes] = useState(60)
  const [timeEntryType, setTimeEntryType] =
    useState<TimeEntryReducer['type']>('increasing')

  const todayDate = useMemo(() => new Date(new Date().toDateString()), [])
  const [date, setDate] = useState<Date | undefined>(todayDate)

  const {
    activeTimeEntry,
    createNewTimeEntry,
    pauseCurrentTimeEntry,
    playCurrentTimeEntry,
  } = useContext(TimeEntriesContext)

  const dateKey = useMemo(() => date?.toISOString().split('T')[0], [date])
  const todayKey = useMemo(
    () => todayDate.toISOString().split('T')[0],
    [todayDate],
  )

  const shortCacheTime = 1000 * 60 * 1
  const longCacheTime = 1000 * 60 * 5
  const staleTime = dateKey === todayKey ? shortCacheTime : longCacheTime

  const { timeEntriesCollection } = useSync()
  const { data: timeEntriesResponse } = useQuery({
    queryKey: ['time-entries', dateKey],
    queryFn: async () => {
      if (!date || !timeEntriesCollection) {
        return { data: [] }
      }
      const startDate = startOfDay(date)
      const endDate = endOfDay(date)

      const results = await timeEntriesCollection
        .find({
          selector: {
            startDate: {
              $gte: startDate.toISOString(),
              $lte: endDate.toISOString(),
            },
          },
          sort: [{ startDate: 'desc' }],
        })
        .exec()

      const plainObjects = results.map((doc) => doc.toJSON())

      return { data: plainObjects }
    },
    staleTime,

    enabled: !!timeEntriesCollection && !!date,
  })

  const mappedEntries: TimeEntry[] = (timeEntriesResponse?.data ?? []).map(
    (entry: any): TimeEntry => ({
      id: entry.id,
      user_id: entry.user?.id,
      issue_id: entry.task?.id,
      hours: entry.timeSpent ?? 0,
      comments: entry.comments ?? '',

      spent_on: entry.startDate?.toString().split('T')[0] ?? '',
      activity_id: entry.activity?.id,
      sincStatus: 'synced',
    }),
  )

  const groupedEntries = groupByIssue(mappedEntries)

  function handlePlayPauseTimer() {
    if (activeTimeEntry && activeTimeEntry.status === 'running') {
      pauseCurrentTimeEntry()
      return
    }

    if (activeTimeEntry && activeTimeEntry.status === 'paused') {
      playCurrentTimeEntry()
      return
    }

    createNewTimeEntry({
      minutesAmount: manualMinutes,
      task: 'TESTE',
      type: timeEntryType,
    })
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
            <BreadcrumbLink href="/components">Menu</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Apontamento</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="my-2 mb-4 scroll-m-20 text-2xl font-bold tracking-tight lg:text-3xl">
        Apontamento
      </h1>

      <Card className="rounded-md">
        <CardContent className="p-6">
          <Card className="shadow-0">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              {/* GRUPO DA ESQUERDA: Agrupa ticket, atividade e descrição */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="relative">
                  <Hash
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2"
                    style={{ width: 14 }}
                  />
                  <Input
                    placeholder="Ticket"
                    className="bg-background w-34 pl-7 font-mono tracking-tighter"
                  />
                </div>

                <Select>
                  <SelectTrigger className="w-[180px] cursor-pointer">
                    <SelectValue placeholder="Atividade" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map(({ value, label, icon: IconComponent }) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="cursor-pointer"
                      >
                        {!!IconComponent && <IconComponent size={16} />}
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input placeholder="Descrição" className="flex-1" />
              </div>

              {/* GRUPO DA DIREITA: Agrupa os controles do timer */}
              <div className="flex items-center gap-2">
                <Input
                  disabled={activeTimeEntry?.status === 'running'}
                  defaultValue="00:00:00"
                  maskOptions={timeMask}
                  style={{ fontSize: 16 }}
                  className="w-24 text-center font-mono text-lg tracking-tight"
                />

                <Button
                  className="font-semibold"
                  onClick={handlePlayPauseTimer}
                  variant={
                    activeTimeEntry?.status === 'running'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {activeTimeEntry?.status === 'running' ? (
                    <Pause className="h-4" />
                  ) : (
                    <Play className="h-4" />
                  )}
                  {activeTimeEntry?.status === 'running' ? 'Parar' : 'Iniciar'}
                </Button>

                {!activeTimeEntry && (
                  <ToggleGroup
                    type="single"
                    onValueChange={(value) => {
                      if (value === 'increasing') setTimeEntryType('increasing')
                      if (value === 'decreasing') setTimeEntryType('decreasing')
                    }}
                    value={timeEntryType}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value="increasing"
                          className="h-6 w-6 cursor-pointer border bg-transparent p-0"
                          aria-label="Tempo Crescente"
                        >
                          <ClockArrowUpIcon
                            className={
                              timeEntryType === 'increasing'
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }
                          />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Tempo Crescente</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value="decreasing"
                          className="h-6 w-6 cursor-pointer border bg-transparent p-0"
                          aria-label="Tempo Decrescente"
                        >
                          <ClockArrowDownIcon
                            className={
                              timeEntryType === 'decreasing'
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }
                          />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Tempo Decrescente</p>
                      </TooltipContent>
                    </Tooltip>
                  </ToggleGroup>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="container mx-auto py-16">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    className="bg-background flex items-center gap-2 border font-sans tracking-tighter"
                  >
                    <CalendarDaysIcon />
                    {date ? (
                      <>
                        <span>{format(date, 'EEEE')}</span>
                        <span className="font-mono">
                          {format(date, 'dd/MM/yyyy')}
                        </span>
                      </>
                    ) : (
                      'Selecione uma data'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="m-none"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="container mx-auto py-4">
              <DataTable columns={columns} data={groupedEntries} />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
