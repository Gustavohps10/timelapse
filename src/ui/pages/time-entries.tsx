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
import { useContext, useState } from 'react'

import { client } from '@/ui/client/client'
import { columns, Row } from '@/ui/components/time-entries-table/columns'
import {
  DataTable,
  TimeEntry,
} from '@/ui/components/time-entries-table/data-table'
import { Timer } from '@/ui/components/timer'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/ui/components/ui/breadcrumb'
import { Button } from '@/ui/components/ui/button'
import { Calendar } from '@/ui/components/ui/calendar'
import { Card, CardContent } from '@/ui/components/ui/card'
import { Input } from '@/ui/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/ui/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/ui/components/ui/tooltip'
import { TimeEntriesContext } from '@/ui/contexts/TimeEntriesContext'
import { TimeEntry as TimeEntryReducer } from '@/ui/reducers/time-entries/reducer'

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

const statuses = ['synced', 'failed', 'pending'] as const

const activityItems = [
  { value: '8', label: 'Design' },
  { value: '9', label: 'Desenvolvimento' },
  { value: '10', label: 'Análise' },
  { value: '11', label: 'Planejamento' },
  { value: '12', label: 'Encerramento' },
  { value: '13', label: 'Teste' },
  { value: '14', label: 'Revisão Código' },
  { value: '15', label: 'Gerência de Configuração' },
  { value: '16', label: 'Correção' },
  { value: '17', label: 'Suporte' },
  { value: '18', label: 'Apoio' },
  { value: '19', label: 'Homologação' },
  { value: '25', label: 'Documentação' },
  { value: '26', label: 'Treinamento' },
  { value: '27', label: 'Reunião' },
  { value: '28', label: 'Gestão' },
]

function getRandomActivityId() {
  const item = activityItems[Math.floor(Math.random() * activityItems.length)]
  return parseInt(item.value, 10)
}

function generateTimeEntry(
  index: number,
  status: (typeof statuses)[number],
  issueId: number,
): TimeEntry {
  return {
    sincStatus: status,
    project_id: 1 + (index % 2),
    user_id: 1 + (index % 2),
    issue_id: issueId,
    hours: Math.floor(Math.random() * 8) + 1,
    comments: `Entrada ${index + 1} - ${status}`,
    spent_on: new Date(Date.now() - index * 86400000)
      .toISOString()
      .split('T')[0],
    activity_id: getRandomActivityId(),
  }
}

const syncedGroup = Array.from({ length: 4 }, (_, i) =>
  generateTimeEntry(i, 'synced', 1000),
)

const otherEntries = Array.from({ length: 20 }, (_, i) => {
  const status = statuses[i % 3]
  const issueId = 567850 + (i % 4)
  return generateTimeEntry(i + 4, status, issueId)
})

const isolatedEntries = [
  generateTimeEntry(100, 'synced', 999001),
  generateTimeEntry(101, 'failed', 999002),
  generateTimeEntry(102, 'pending', 999003),
]

const timeEntries: TimeEntry[] = [
  ...syncedGroup,
  ...otherEntries,
  ...isolatedEntries,
].sort(() => Math.random() - 0.5)

export function groupByIssue(data: TimeEntry[]): Row[] {
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
  const [manualMinutes, setManualMinutes] = useState(60)
  const [timeEntryType, setTimeEntryType] =
    useState<TimeEntryReducer['type']>('increasing')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { activeTimeEntry, createNewTimeEntry, interruptCurrentTimeEntry } =
    useContext(TimeEntriesContext)

  const { data: timeEntriesResponse, isPending } = useQuery({
    queryKey: ['time-entries', date],
    queryFn: () =>
      client.services.timeEntries.findByMemberId({
        body: {
          memberId: '230',
          startDate: date ?? new Date(),
          endDate: date ?? new Date(),
        },
      }),
  })

  console.log('response', timeEntriesResponse)

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
                      if (value === 'a') setTimeEntryType('increasing')
                      if (value === 'c') setTimeEntryType('decreasing')
                    }}
                    value={
                      timeEntryType === 'increasing'
                        ? 'a'
                        : timeEntryType === 'decreasing'
                          ? 'c'
                          : ''
                    }
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value="a"
                          className="h-6 w-6 cursor-pointer border"
                        >
                          <ClockArrowUpIcon className="text-muted-foreground" />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent className="bg-background text-foreground">
                        <p className="font-semibold">Tempo Crescente</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value="c"
                          className="h-6 w-6 cursor-pointer border"
                        >
                          <ClockArrowDownIcon className="text-muted-foreground" />
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
                        onClick={() =>
                          createNewTimeEntry({
                            minutesAmount: manualMinutes,
                            task: 'TESTE',
                            type: timeEntryType,
                          })
                        }
                      >
                        {!!activeTimeEntry ? <Pause /> : <Play />}
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
