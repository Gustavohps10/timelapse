import { format } from 'date-fns'
import {
  BarChart2,
  Briefcase,
  CalendarCheck,
  CalendarDaysIcon,
  CheckCircle,
  ClipboardCheck,
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
import { useState } from 'react'

import { columns } from '@/ui/components/time-entries-table/columns'
import {
  DataTable,
  TimeEntry,
} from '@/ui/components/time-entries-table/data-table'
import { Button } from '@/ui/components/ui/button'
import { Calendar } from '@/ui/components/ui/calendar'
import { Card } from '@/ui/components/ui/card'
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

export const timeEntries: TimeEntry[] = Array.from({ length: 10 }, (_, i) => ({
  project_id: 1,
  user_id: 1,
  issue_id: 567850 + i,
  hours: Math.floor(Math.random() * 8) + 1,
  comments: `Entrada de tempo ${i + 1}`,
  spent_on: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
}))

export function TimeEntries() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-stretch gap-2">
        {/* Coluna esquerda com inputs */}
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

        <div className="flex gap-2">
          <div className="flex flex-col gap-2">
            <Button className="rounded-xl">
              Iniciar <Play />
            </Button>

            <Button variant="secondary" className="rounded-xl">
              Marcar <Pin />
            </Button>
          </div>

          <div className="flex h-full w-40 items-center justify-center rounded-md border p-2">
            <span className="mt-1 scroll-m-20 font-mono text-4xl leading-tight font-bold tracking-tighter text-zinc-800 dark:text-zinc-300">
              00:00
            </span>
          </div>
        </div>
      </div>

      <div className="py-4">
        <div className="flex items-center gap-2">
          <Button variant="outline">Anterior</Button>
          <Button variant="outline">Hoje</Button>
          <Button variant="outline">Próximo</Button>

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
          <DataTable columns={columns} data={timeEntries} />
        </div>
      </div>

      <Button>Lancar Horas</Button>
    </Card>
  )
}
