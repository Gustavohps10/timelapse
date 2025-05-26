import { format } from 'date-fns'
import {
  BarChart2,
  Briefcase,
  CalendarCheck,
  CalendarDaysIcon,
  CheckCircle,
  ClipboardCheck,
  ClockArrowUp,
  Code,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  Hash,
  LifeBuoy,
  Palette,
  Pin,
  Play,
  SearchCode,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import { useContext, useState } from 'react'

import { columns, Row } from '@/ui/components/time-entries-table/columns'
import {
  DataTable,
  TimeEntry,
} from '@/ui/components/time-entries-table/data-table'
import { Timer } from '@/ui/components/timer'
import { Button } from '@/ui/components/ui/button'
import { Calendar } from '@/ui/components/ui/calendar'
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
import { TimeEntriesContext } from '@/ui/contexts/TimeEntriesContext'

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

const groupedEntries = groupByIssue(timeEntries)

export function TimeEntries() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { activeTimeEntry, createNewTimeEntry, interruptCurrentTimeEntry } =
    useContext(TimeEntriesContext)

  return (
    <>
      <div className="container mx-auto flex items-stretch justify-between gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-stretch">
              <div className="border-input flex w-10 items-center justify-center rounded-l-md border">
                <Hash size={16} />
              </div>
              <Input placeholder="Ticket" className="w-24 rounded-l-none" />
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

        <div className="flex flex-col gap-2">
          <div className="flex h-full items-center justify-center rounded-md border p-2">
            <Timer />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                createNewTimeEntry({ minutesAmount: 60, task: 'TESTE' })
              }
            >
              <Play />
            </Button>

            <Button variant="secondary" size="sm">
              <Pin />
            </Button>
            <Button size="sm" variant="secondary">
              <ClockArrowUp />
            </Button>
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
    </>
  )
}
