'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  BarChart2,
  Briefcase,
  CalendarCheck,
  CalendarDaysIcon,
  CheckCircle,
  ChevronsDownIcon,
  ChevronsUpIcon,
  ClipboardCheck,
  ClockArrowDownIcon,
  ClockArrowUpIcon,
  CloudUpload,
  Code,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  Hash,
  LifeBuoy,
  Palette,
  Pause,
  Pin,
  Play,
  SearchCode,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import { useContext, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { columns, Row } from '@/components/time-entries-table/columns'
import {
  DataTable,
  TimeEntry,
} from '@/components/time-entries-table/data-table'
import { Timer } from '@/components/timer'
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
import { useAuth } from '@/hooks/use-auth'
import { useClient } from '@/hooks/use-client'
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
        activity_id: 1,
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
  const client = useClient()
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [manualMinutes, setManualMinutes] = useState(60)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
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

  const { data: timeEntriesResponse } = useQuery({
    queryKey: ['time-entries', dateKey],
    queryFn: () => {
      // Buscar últimos 30 dias para manter dados atualizados
      const endDate = date ?? new Date()
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 30)

      return client.services.timeEntries.findByMemberId({
        body: {
          workspaceId: workspaceId!,
          memberId: user?.id.toString()!,
          startDate,
          endDate,
        },
      })
    },
    staleTime,
  })

  console.log('⏱️ Time entries response:', timeEntriesResponse)
  const mappedEntries: TimeEntry[] = (timeEntriesResponse?.data ?? []).map(
    (entry): TimeEntry => ({
      id: entry.id,
      project_id: entry.project?.id,
      user_id: entry.user?.id,
      issue_id: entry.issue?.id,
      hours: entry.hours ?? 0,
      comments: entry.comments ?? '',
      spent_on: entry.spentOn?.toString().split('T')[0] ?? '',
      activity_id: entry.activity?.id,
      sincStatus: 'synced',
    }),
  )

  const groupedEntries = groupByIssue(mappedEntries)

  function handlePlayPauseTimer() {
    if (activeTimeEntry && activeTimeEntry.status == 'running') {
      pauseCurrentTimeEntry()
      return
    }

    if (activeTimeEntry && activeTimeEntry.status == 'paused') {
      playCurrentTimeEntry()
      return
    }

    createNewTimeEntry({
      minutesAmount: manualMinutes,
      task: 'TESTE',
      type: timeEntryType,
    })
  }

  function handleWithSync() {
    if (!isAuthenticated) {
      toast('Você precisa se autenticar para sincronizar.', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login'),
        },
        description: 'Faça login para sincronizar seus apontamentos.',
      })
      return
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
          <div className="container mx-auto flex items-stretch justify-between gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative my-1">
                  <Hash
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2"
                    style={{ width: 14 }}
                  />
                  <Input
                    placeholder="Ticket"
                    className="bg-background w-28 pl-7 font-mono tracking-tighter"
                  />
                </div>

                <Select>
                  <SelectTrigger className="w-3xs cursor-pointer">
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
              </div>

              <Input placeholder="Descrição" className="w-full" />
            </div>

            <div className="flex items-start gap-2">
              {/* Sidebar com Up/Down */}
              {!activeTimeEntry && (
                <div className="flex flex-col gap-2">
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
                        >
                          <ClockArrowUpIcon
                            className={
                              timeEntryType === 'increasing'
                                ? 'text-foreground'
                                : 'text-zinc-500'
                            }
                          />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent className="bg-background text-foreground">
                        <p className="font-semibold">Tempo Crescente</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value="decreasing"
                          className="h-6 w-6 cursor-pointer border bg-transparent p-0"
                        >
                          <ClockArrowDownIcon
                            className={
                              timeEntryType === 'decreasing'
                                ? 'text-foreground'
                                : 'text-zinc-500'
                            }
                          />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent className="bg-background text-foreground">
                        <p className="font-semibold">Tempo Decrescente</p>
                      </TooltipContent>
                    </Tooltip>
                  </ToggleGroup>
                </div>
              )}

              {/* Conteúdo principal: visor + botões */}
              <div className="flex flex-col gap-2">
                <div className="relative flex h-full items-center justify-center rounded-md border p-2">
                  {activeTimeEntry?.type === 'increasing' && (
                    <ChevronsUpIcon
                      size={14}
                      className="absolute top-1 left-1 text-zinc-600"
                    />
                  )}
                  {activeTimeEntry?.type === 'decreasing' && (
                    <ChevronsDownIcon
                      size={14}
                      className="absolute top-1 left-1 text-zinc-600"
                    />
                  )}
                  <Timer onTimeChange={setManualMinutes} />
                </div>

                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={handlePlayPauseTimer}
                      >
                        {activeTimeEntry &&
                        activeTimeEntry.status == 'running' ? (
                          <Pause />
                        ) : (
                          <Play />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground">
                      <p className="font-semibold">Iniciar</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                      >
                        <Pin />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground">
                      <p className="font-semibold">Marcar</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className="h-8 w-8 p-0"
                        variant="ghost"
                        onClick={handleWithSync}
                      >
                        <CloudUpload />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground">
                      <p className="font-semibold">Sincronizar</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto py-4">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-56">
                    <CalendarDaysIcon />
                    {date
                      ? format(date, 'EEEE - dd/MM/yyyy')
                      : 'Selecione uma data'}
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
