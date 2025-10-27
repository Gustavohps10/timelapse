'use client'

import {
  AlertCircle,
  Bookmark,
  CheckCircle,
  Clock,
  ClockArrowDownIcon,
  ClockArrowUpIcon,
  GripVertical,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import React, { memo, useMemo, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { useAuth } from '@/hooks'
import { timeMask } from '@/pages/time-entries'
import type { SyncMetadataRxDBDTO } from '@/sync/metadata-sync-schema'
import type { SyncTaskRxDBDTO } from '@/sync/tasks-sync-schema'

function formatTime(seconds: number): string | React.ReactNode {
  if (seconds < 0) {
    return (
      <span className="rounded bg-zinc-200 px-1 py-[1px] text-[10px] font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
        N/R
      </span>
    )
  }
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${h}:${m}:${s}`
}

const iconMap: { [key: string]: React.ElementType } = {
  Code: LucideIcons.Code,
  Wrench: LucideIcons.Wrench,
  FlaskConical: LucideIcons.FlaskConical,
  LifeBuoy: LucideIcons.LifeBuoy,
  Palette: LucideIcons.Palette,
  BarChart2: LucideIcons.BarChart2,
  CalendarCheck: LucideIcons.CalendarCheck,
  CheckCircle: LucideIcons.CheckCircle,
  SearchCode: LucideIcons.SearchCode,
  Settings: LucideIcons.Settings,
  Handshake: LucideIcons.Handshake,
  ClipboardCheck: LucideIcons.ClipboardCheck,
  FileText: LucideIcons.FileText,
  GraduationCap: LucideIcons.GraduationCap,
  Users: LucideIcons.Users,
  Briefcase: LucideIcons.Briefcase,
  ShieldCheck: LucideIcons.ShieldCheck,
  Activity: LucideIcons.Activity,
}

export const TaskCard = memo(function TaskCard({
  task,
  metadata,
  onTaskClick,
  dragHandleProps,
  style,
}: {
  task: SyncTaskRxDBDTO
  metadata: SyncMetadataRxDBDTO
  onTaskClick?: (task: SyncTaskRxDBDTO) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | null
  style?: React.CSSProperties
}) {
  const { user } = useAuth()
  const [timeEntryType, setTimeEntryType] = useState<
    'increasing' | 'decreasing'
  >('increasing')

  const statusMeta = useMemo(
    () => metadata.taskStatuses.find((s) => s.id === task.status?.id),
    [metadata.taskStatuses, task.status?.id],
  )

  const otherParticipants = useMemo(
    () => task.participants?.filter((p) => p.id !== task.assignedTo?.id) || [],
    [task.participants, task.assignedTo?.id],
  )

  const isTimeNotRegistered = useMemo(
    () =>
      (!task.timeEntries || task.timeEntries.length === 0) &&
      task.spentHours &&
      task.spentHours > 0,
    [task.timeEntries, task.spentHours],
  )

  const estimationBreakdown = useMemo(() => {
    const uid = user?.id?.toString()
    if (!uid || !task.estimatedTimes) return []

    return task.estimatedTimes.map((estimation) => {
      const allowedActivityIds = new Set(
        estimation.activities.map((act) => act.id),
      )

      const spentHours = (task.timeEntries || [])
        .filter(
          (entry) =>
            entry.user.id === uid &&
            entry.activity?.id &&
            allowedActivityIds.has(entry.activity.id),
        )
        .reduce((acc, entry) => acc + (entry.timeSpent ?? 0), 0)

      return {
        id: estimation.id,
        name: estimation.name,
        estimatedSeconds: (estimation.hours ?? 0) * 3600,
        spentSeconds: isTimeNotRegistered ? -1 : spentHours * 3600,
      }
    })
  }, [task.estimatedTimes, task.timeEntries, user?.id, isTimeNotRegistered])

  const totalUserTimeSpentInSeconds = useMemo(() => {
    if (isTimeNotRegistered) {
      return -1
    }

    const uid = user?.id?.toString()
    if (!uid) return 0

    const totalHours = (task.timeEntries || [])
      .filter((entry) => entry.user.id === uid)
      .reduce((acc, entry) => acc + (entry.timeSpent ?? 0), 0)

    return totalHours * 3600
  }, [task.timeEntries, user?.id, isTimeNotRegistered])

  const activities = useMemo(() => metadata.activities || [], [metadata])

  return (
    <Card
      style={style}
      className="group relative w-full cursor-pointer rounded-md border border-zinc-200 transition-shadow duration-200 hover:shadow-md dark:border-zinc-700 dark:hover:shadow-lg"
      onClick={() => onTaskClick?.(task)}
    >
      <CardHeader className="flex flex-row items-start justify-between p-2">
        <div className="flex items-start gap-1">
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab text-zinc-500 select-none hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          {statusMeta && (
            <div className="mb-1 flex w-full justify-end">
              <div
                className="flex items-center gap-1 rounded px-1.5 py-[4px] text-[11px] font-medium"
                style={{
                  backgroundColor: statusMeta.colors.background,
                  color: statusMeta.colors.text,
                }}
              >
                {statusMeta.icon &&
                  (() => {
                    const Icon = (LucideIcons as any)[statusMeta.icon]
                    return Icon ? <Icon className="h-3 w-3" /> : null
                  })()}
                {task.status.name}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-default items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center font-mono text-[12px] font-medium tracking-tight">
                  {formatTime(totalUserTimeSpentInSeconds)}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <h1 className="text-xs font-semibold">Estimativas:</h1>
              {estimationBreakdown.length > 0 ? (
                <table className="mt-1 border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-[12px]" />
                      <th className="px-2 text-right text-[12px]">Estimado</th>
                      <th className="px-2 text-right text-[12px]">Gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimationBreakdown.map((item) => (
                      <tr key={item.id}>
                        <td className="flex items-center gap-1.5 py-0.5 pr-2 text-[12px]">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              item.spentSeconds >= 0 &&
                              item.spentSeconds > item.estimatedSeconds
                                ? 'bg-red-400'
                                : 'bg-green-400'
                            }`}
                          />
                          {item.name}
                        </td>
                        <td className="px-2 text-right font-mono text-[12px] tracking-tighter">
                          {formatTime(item.estimatedSeconds)}
                        </td>
                        <td className="px-2 text-right font-mono text-[12px] tracking-tighter">
                          {formatTime(item.spentSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mt-1 text-center text-xs text-zinc-500">
                  Nenhuma estimativa definida para esta tarefa.
                </p>
              )}
            </TooltipContent>
          </Tooltip>
          {task.conflicted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Esta tarefa possui um conflito de sincronização.</p>
              </TooltipContent>
            </Tooltip>
          )}
          {task.syncedAt && (
            <Tooltip>
              <TooltipTrigger asChild>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Sincronizado em {new Date(task.syncedAt).toLocaleString()}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Clock className="h-4 w-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Iniciar apontamento</p>
              </TooltipContent>
            </Tooltip>

            <PopoverContent
              side="left"
              align="start"
              className="w-64 p-3 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-2 text-sm">
                <div>
                  <h4 className="line-clamp-2 leading-tight font-semibold">
                    Apontamento
                  </h4>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    #{task.id} - {task.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Select>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map((activity) => {
                        const Icon = iconMap[activity.icon]
                        return (
                          <SelectItem key={activity.id} value={activity.id}>
                            <div className="flex items-center gap-1">
                              {Icon && <Icon size={12} />}
                              {activity.name}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  <Input
                    defaultValue="00:00:00"
                    maskOptions={timeMask}
                    style={{ fontSize: 14 }}
                    className="w-20 px-2 py-1 text-center font-mono text-sm tracking-tight"
                  />

                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-6 w-6 p-3.5"
                  >
                    <LucideIcons.PlayIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Input
                  placeholder="Comentário (opcional)"
                  className="h-7 px-2 py-1 text-xs"
                />

                <div className="flex items-center justify-between">
                  <ToggleGroup
                    type="single"
                    value={timeEntryType}
                    onValueChange={(v: 'increasing' | 'decreasing') =>
                      v && setTimeEntryType(v)
                    }
                    className="gap-1"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value="increasing"
                          className="h-6 w-6 p-0"
                        >
                          <ClockArrowUpIcon className="h-3.5 w-3.5" />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        Crescente
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value="decreasing"
                          className="h-6 w-6 p-0"
                        >
                          <ClockArrowDownIcon className="h-3.5 w-3.5" />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        Decrescente
                      </TooltipContent>
                    </Tooltip>
                  </ToggleGroup>

                  <Button className="flex h-7 items-center gap-1 px-2 text-xs">
                    <LucideIcons.Check className="h-3.5 w-3.5" />
                    Confirmar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-2">
        <div className="mb-1 flex gap-1">
          <Bookmark className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-300" />
          <div className="flex items-center gap-2 overflow-hidden">
            {task.url ? (
              <a
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-foreground line-clamp-2 text-xs font-semibold tracking-tighter break-all text-blue-600 hover:underline"
                title={task.title}
              >
                {task.id} - {task.title}
              </a>
            ) : (
              <p
                className="text-foreground line-clamp-2 text-xs font-semibold tracking-tighter break-all"
                title={task.title}
              >
                {task.id} - {task.title}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2">
            {task.assignedTo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-7 w-7 shrink-0 border-2 border-white dark:border-zinc-800">
                    <AvatarImage
                      src={
                        task.assignedTo.id === user?.id?.toString()
                          ? user?.avatarUrl
                          : undefined
                      }
                      alt={`Foto de perfil (${user?.firstname})`}
                    />
                    <AvatarFallback>
                      {task.assignedTo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Responsável: {task.assignedTo.name}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <div className="flex items-center">
              {Array.from(
                new Map(otherParticipants.map((p) => [p.id, p])).values(),
              ).map((p, i) => (
                <Tooltip key={p.id}>
                  <TooltipTrigger asChild>
                    <Avatar
                      className={`h-6 w-6 shrink-0 border-2 border-white dark:border-zinc-700 ${
                        i !== 0 ? '-ml-2' : ''
                      }`}
                    >
                      <AvatarFallback className="text-xs">
                        {p.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{p.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
