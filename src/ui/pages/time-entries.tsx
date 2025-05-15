import { format } from 'date-fns'
import { useState } from 'react'

import { Button } from '@/ui/components/ui/button'
import { Calendar } from '@/ui/components/ui/calendar'
import { Card } from '@/ui/components/ui/card'
import { Checkbox } from '@/ui/components/ui/checkbox'
import { Input } from '@/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select'
import { Textarea } from '@/ui/components/ui/textarea'

export function TimeEntries() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Card className="space-y-4 p-4">
      {/* Linha de seleção de ticket e atividade */}
      <div className="flex items-center gap-2">
        <Input placeholder="Ticket" className="max-w-[150px]" />
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Atividade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dev">Desenvolvimento</SelectItem>
            <SelectItem value="reuniao">Reunião</SelectItem>
          </SelectContent>
        </Select>
        <Button>Iniciar</Button>
        <Textarea
          placeholder="Descrição"
          className="ml-4 max-w-[300px] flex-1"
        />
        <Button variant="outline">+</Button>
      </div>

      {/* Linha de navegação de datas e calendário */}
      <div className="flex items-center gap-2">
        <Button variant="outline">{`< Anterior`}</Button>
        <Button variant="outline">Hoje</Button>
        <Button variant="outline">{`Próximo >`}</Button>
        <span className="mx-2 font-semibold">
          {date ? format(date, 'EEEE - dd/MM/yyyy') : 'Selecione uma data'}
        </span>
        <Checkbox className="ml-auto" id="exibir" />
        <label htmlFor="exibir" className="text-sm">
          Exibir Comentários
        </label>
      </div>

      <Calendar mode="single" selected={date} onSelect={setDate} />

      {/* Tabela simulada */}
      <div className="mt-4 grid grid-cols-6 gap-2 border-t pt-2 text-sm font-medium">
        <div>Descrição</div>
        <div>Hr. Ini.</div>
        <div>Hr. Fin.</div>
        <div>Dif.</div>
        <div>Ticket</div>
        <div>Atividade</div>
      </div>
      {/* Aqui viriam as linhas de apontamentos reais */}
    </Card>
  )
}
