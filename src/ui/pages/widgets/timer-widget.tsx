import {
  BarChart2,
  Briefcase,
  CalendarCheck,
  Check,
  CheckCircle,
  ChevronsUpDown,
  ClipboardCheck,
  ClockArrowUp,
  Code,
  FileText,
  FlaskConical,
  GraduationCap,
  GripVertical,
  Handshake,
  LifeBuoy,
  Palette,
  Pin,
  Play,
  SearchCode,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Timer } from '@/ui/components/timer'
import { Badge } from '@/ui/components/ui/badge'
import { Button } from '@/ui/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/components/ui/command'
import { Input } from '@/ui/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/components/ui/popover'
import { cn } from '@/ui/lib/utils'

const activities = [
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
export function TimerWidget() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    document.body.style.background = 'transparent'

    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden px-10 py-4 text-white">
      <div
        className="drag-bar relative my-2 flex justify-center rounded-md p-2"
        style={
          {
            backgroundColor: 'rgba(0,0,0,0.4)',
            paddingLeft: '16px',
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
            WebkitAppRegion: 'drag',
          } as React.CSSProperties & { WebkitAppRegion: string }
        }
      >
        <Badge
          variant="outline"
          className="absolute top-0 left-0 -translate-[50%] bg-[#0000007c]"
        >
          #51094
        </Badge>
        <Timer size="medium" />
      </div>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <Button className="h-7 w-7">
            <Play />
          </Button>
          <Button
            size="sm"
            className="h-7 w-7 bg-[#0000007c] hover:bg-[#000000a8]"
          >
            <Pin />
          </Button>
          <Button
            size="sm"
            className="h-7 w-7 bg-[#0000007c] hover:bg-[#000000a8]"
          >
            <ClockArrowUp />
          </Button>
        </div>

        <Button size="sm" className="w-2 bg-[#00000031] hover:bg-[#000000a8]">
          <GripVertical className="w-3" />
        </Button>
      </div>
      <div className="my-2 w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="bg-background w-full justify-between hover:bg-neutral-900"
            >
              {value
                ? activities.find((framework) => framework.value === value)
                    ?.label
                : 'Atividade'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search framework..." />
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {activities.map((framework) => (
                    <CommandItem
                      key={framework.value}
                      value={framework.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? '' : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 w-full',
                          value === framework.value
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {/* {framework.icon && <framework.icon />} */}
                      {framework.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input className="bg-background my-1" placeholder="Ticket" />
        <Input className="bg-background" placeholder="Descricao" />
      </div>
    </div>
  )
}
