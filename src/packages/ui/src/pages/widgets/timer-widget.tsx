import {
  BarChart2,
  Briefcase,
  CalendarCheck,
  Check,
  CheckCircle,
  ChevronsUpDown,
  ClipboardCheck,
  CloudUpload,
  Code,
  EllipsisVertical,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  Hash,
  LetterText,
  LifeBuoy,
  Palette,
  Pin,
  Play,
  SearchCode,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Timer } from '@/components/timer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

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
        className="drag-bar relative my-2 flex justify-center rounded-md border p-2"
        style={
          {
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
            WebkitAppRegion: 'drag',
          } as React.CSSProperties & { WebkitAppRegion: string }
        }
      >
        <Badge
          variant="outline"
          className="absolute top-0 left-0 -translate-y-[120%] bg-[rgba(0,0,0,0.4)]"
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
            <CloudUpload />
          </Button>
        </div>

        <Button
          size="sm"
          className="h-8 w-8 bg-[#00000031] p-2 hover:bg-[#000000a8]"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle sessão expansiva"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </div>

      {open && (
        <ExpansiveTimeWigetSession
          value={value}
          setValue={setValue}
          setOpen={setOpen}
        />
      )}
    </div>
  )
}

interface ExpansiveTimeWigetSessionProps {
  value: string
  setValue: (val: string) => void
  setOpen: (open: boolean) => void
}

function ExpansiveTimeWigetSession({
  value,
  setValue,
}: ExpansiveTimeWigetSessionProps) {
  const [commandInput, setCommandInput] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.blur()
  }, [])

  return (
    <div className="my-2 w-full [&_*]:text-[12px]">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={true}
            className="bg-background h-8 w-full justify-between hover:bg-zinc-900"
          >
            {value
              ? activities.find((framework) => framework.value === value)?.label
              : 'Atividade'}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command className="w-[140px]">
            <CommandInput
              ref={inputRef}
              placeholder="Procurar"
              className="h-8"
              style={{ height: 32 }}
              value={commandInput}
              onValueChange={setCommandInput}
            />
            <CommandList>
              <CommandEmpty>Nenhuma atividade encontrada.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[192px] rounded-md [&_*]:text-[12px]">
                  {activities
                    .filter((framework) =>
                      framework.label
                        .toLowerCase()
                        .includes(commandInput.toLowerCase()),
                    )
                    .map((framework) => (
                      <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? '' : currentValue)
                          setPopoverOpen(false)
                        }}
                        className="cursor-pointer [&_*]:text-[10px]"
                      >
                        <Check
                          className={cn(
                            'mr-2 w-full',
                            value === framework.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {framework.icon && (
                          <framework.icon style={{ width: 14 }} />
                        )}
                        {framework.label}
                      </CommandItem>
                    ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="relative my-1">
        <Hash
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2"
          style={{ width: 14 }}
        />
        <Input placeholder="Ticket" className="bg-background h-8 pl-7" />
      </div>

      <div className="relative my-1">
        <LetterText
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2"
          style={{ width: 14 }}
        />
        <Input placeholder="Descricao" className="bg-background h-8 pl-7" />
      </div>
    </div>
  )
}
