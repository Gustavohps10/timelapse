import { format } from 'date-fns'
import { Shapes, Ticket } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/ui/components/ui/button'
import { Calendar } from '@/ui/components/ui/calendar'
import { Card } from '@/ui/components/ui/card'
import { Checkbox } from '@/ui/components/ui/checkbox'
import { Input } from '@/ui/components/ui/input'
import { Label } from '@/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select'

export function TimeEntries() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <div>
          <Label className="text-muted-foreground flex items-center gap-1 text-sm">
            <Ticket size={20} /> Ticket
          </Label>
          <Input placeholder="Ticket" className="max-w-[150px]" />
        </div>

        <div>
          <Label className="text-muted-foreground flex items-center gap-1 text-sm">
            <Shapes size={20} /> Atividade
          </Label>

          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-">--- Selecione ---</SelectItem>
              <SelectItem value="8">Design</SelectItem>
              <SelectItem value="9">Desenvolvimento</SelectItem>
              <SelectItem value="10">Analise</SelectItem>
              <SelectItem value="11">Planejamento</SelectItem>
              <SelectItem value="12">Encerramento</SelectItem>
              <SelectItem value="13">Teste</SelectItem>
              <SelectItem value="14">Revisão Código</SelectItem>
              <SelectItem value="15">Gerência de Configuração</SelectItem>
              <SelectItem value="16">Correção</SelectItem>
              <SelectItem value="17">Suporte</SelectItem>
              <SelectItem value="18">Apoio</SelectItem>
              <SelectItem value="19">Homologação</SelectItem>
              <SelectItem value="25">Documentação</SelectItem>
              <SelectItem value="26">Treinamento</SelectItem>
              <SelectItem value="27">Reunião</SelectItem>
              <SelectItem value="28">Gestão</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>Iniciar</Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline">Anterior</Button>
        <Button variant="outline">Hoje</Button>
        <Button variant="outline">Próximo</Button>
        <span className="mx-2 font-semibold">
          {date ? format(date, 'EEEE - dd/MM/yyyy') : 'Selecione uma data'}
        </span>
        <Checkbox className="ml-auto" id="exibir" />
        <label htmlFor="exibir" className="text-sm">
          Exibir Comentários
        </label>
      </div>

      <Card className="block">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </Card>

      <div className="mt-4 grid grid-cols-6 gap-2 border-t pt-2 text-sm font-medium">
        <div>Descrição</div>
        <div>Hr. Ini.</div>
        <div>Hr. Fin.</div>
        <div>Dif.</div>
        <div>Ticket</div>
        <div>Atividade</div>
      </div>
    </Card>
  )
}
